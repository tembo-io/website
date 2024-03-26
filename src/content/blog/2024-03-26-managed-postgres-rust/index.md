---
slug: managed-postgres-rust
title: 'Building a Managed Postgres Service in Rust: Part 1'
authors: [adam]
tags: [postgres, rust]
image: './social.png'
date: 2024-03-26T12:00
description: Building a managed Postgres service in Rust on Kubernetes
---

Tembo’s cloud platform is about a year old as of March 2024. However, when development started the technology requirements were only loosely defined. We knew we had to build a managed postgres service, we needed to be able to template and configure those instances of Postgres, and we needed to be able to install extensions into it. At the very minimum, we wanted our users to be able to come to our web app and create a new Postgres instance in our Cloud platform, install some extensions into that instance, and then connect to that postgres instance using a common tool like `psql`.

We defined this very minimal requirement within the first week of our team forming, and meant we could start to sketch out some architecture for a demo’able product. Drawing inspiration from other [cloud platforms](https://developer.confluent.io/courses/confluent-cloud-networking/overview/#:~:text=There%20are%20two%20main%20ways,maintenance%2C%20and%20operations%20take%20place.), we quickly decided that we would architect the platform with two high-level components; a control-plane and a data-plane. Two early assumptions were that there could be one to many data-planes per control-plane, and that the control-plane may not always be able to reach the data plane (for example if data-plane is behind a restricted firewall), so these two components must stay highly decoupled. Decoupling the infrastructure enabled us to move quickly in the control-plane without risk of impacting the managed infrastructure in the data-plane.

![alt_text](p0.png "image_tooltip")

## The Control Plane

The initial version of the control-plane consisted of just a web UI and an HTTP server. The HTTP server’s primary job is to service Create, Read, Update, and Delete (CRUD) requests for Tembo instances. The server’s GET endpoints do things like list all the instances that belong to an organization or all the attributes and configuration for a specific instance. PATCH routes handle updating instances with operations like restarting, installing an extension, or changing a configuration.

All state is persisted in a Postgres instance dedicated to the control-plane. This includes all metadata related to instances in the platform such as their infrastructure requirements (cpu / mem / storage), postgres extensions installed, and any custom configurations applied to the instance.

Tembo’s clients, the web UI (hosted at platform.tembo.io), the [Tembo Terraform provider](https://github.com/tembo-io/terraform-provider-tembo), and the [Tembo CLI](https://github.com/tembo-io/tembo/tree/main/tembo-cli) all communicate with the control-plane through an HTTP interface.

![alt_text](p1.png "image_tooltip")

## A Finite State Machine

Managing the lifecycle of the infrastructure for a database and its related services is complex. For example, many operations in Postgres require restarts (e.g. changing shared_preload_libraries) and can be highly disruptive. Other changes should be multi-step, for example deleting a database may first require to suspend or pause the instance before deleting it. Simple HTTP request validation was not enough to model the state changes, and transitions would not only happen on requests. [Others have implemented](https://www.citusdata.com/blog/2016/08/12/state-machines-to-run-databases/) state machines to help facilitate the management of databases, which lead us down this path.

Transitions are events that move an instance from one state to another. These can be thought of as events. For example, when instances are first created they are in the “Submitted” state. When that instance receives a “Created” event back from the data-plane, it can transition to “Up”. Likewise, “Up” instances can move to a “Configuring” state when they receive “Update” events, and do not transition back to “Up” until their configuration is reported as complete via an “Updated” event. Error events can transition an instance into an error state and instances can recover out of an error state when recovered.

![fsm](fsm.png "fsm")

## FSM in Rust

The majority of the Tembo platform is written in Rust, and the state machine is no different. All possible states of a Tembo instance are represented as variants of a single Enum. At any moment in time, a Tembo instance is in exactly one state. The state is persisted in a Postgres instance dedicated to the control-plane.

```rust
pub enum State {
   Configuring,
   Deleted,
   Deleting,
   Error,
   Restarting,
   Starting,
   Stopped,
   Stopping,
   Submitted
   Up,
}
```

The transitions between states can be arbitrarily complex. For example, installation of certain extensions requires Postgres to be restarted, while others do not. Therefore, an Update event on an instance in the Up state could result in an instance transitioning to either a Configuring state or the Restarting state. Invalid state transitions result in an error and no transition in state. 

Below is a subset of the transition definitions implemented into the Tembo finite state machine. Any existing State can attempt to transition to the next state by calling next() on itself, along with the event type and the instance itself. The transition is defined as the pair of the current state and the Event type. As mentioned earlier, arbitrary transition logic can be applied on the transitions but it is not required. For example, ``(State::Up, Event::Restarted) => Ok(State::Up)`` defines the transition from Submitted to  Up, via and Restarted event.

```rust
impl State {
   pub fn next(
       self,
       event: Event,
       instance: &Instance,
   ) -> Result<State, StateError> {
       match (self, event) {
           (State::Up, Event::Restarted) => Ok(State::Up),
           (State::Up, Event::Update) => {
               let desired = Some(instance.clone().desired_spec);
               let actual = instance.clone().actual_spec;
               match restart::restart_expected(&desired, &actual).await {
                   true => Ok(State::Restarting),
                   false => Ok(State::Configuring),
               }
           }
           (State::Up, Event::Updated) => Ok(State::Up),
           (State::Restarting, Event::Restarted) => Ok(State::Restarting),
           
           … other state transitions …   
           
           (State::Deleted, _) => Err(StateError::IllegalTransition(
               format!("instance {} is deleted", instance.instance_id).to_owned(),
           )),
           // undefined states
           (s, e) => Err(StateError::UndefinedTransition(format!(
               "Invalid state-event combination: state: {s:#?} => event:{e:#?}"
           ))),
       }
   }
}
```

With a finite state machine in place, all CRUD requests pass through both basic HTTP request validation, and state transitions are validated before any database change is applied. All valid state change requests are emitted as a CRUD event to the data-plane.

![alt_text](p2.png "image_tooltip")

## Buffer tasks between the planes

The task duration for processing events in the data-plane is quite variable. For example, Creating a new instance could take seconds to minutes depending on whether an image is cached on a node, or if kubernetes needs to add a new node to the cluster in order to deploy the instance. Once an instance is created, events like installing an extension could happen within seconds for a small extension. Changing a configuration could happen in milliseconds for a simple change like changing the search_path. In the case of a shared_preload_libraries change, it could take over a minute since Postgres will also need to be restarted. Implementing a queue for these tasks allowed us to buffer these requests, and allow the data-plane to determine when and how often tasks are retried. Further, implementing a ueue means that complete outages in either the control-plane or the data-plane do not immediately cause system failures, though the queues will begin to build up.  

As a Postgres company, like many others ([Dagster](https://dagster.io/blog/skip-kafka-use-postgres-message-queue), [CrunchyData](https://www.crunchydata.com/blog/message-queuing-using-native-postgresql)) we implemented the queue on Postgres. It was built as Rust crate to fit with our tech stack initially, but we quickly realized that we could share the implementation with all Postgres users if it lived as an extension, so we [released it as PGMQ](https://tembo.io/blog/introducing-pgmq).

![alt_text](p0.png "image_tooltip")

## Conducting events in the data-plane

After the control-plane sends CRUD events to PGMQ, [Conductor](https://github.com/tembo-io/tembo/tree/main/conductor), the service that handles all execution of orders from the control-plane and into the data-plane, processes them. Conductor has a critical job but a narrow set of responsibilities. It reads the Spec for an instance from the queue, then applies them by communicating with the Kubernetes API. It may create new Tembo instances, update, restart, or delete instances. All of the operations applied by Conductor are ultimately applied to Tembo instances via the [Tembo Operator](https://github.com/tembo-io/tembo/tree/main/tembo-operator).

Read more about the Kubernetes footprint in the [Tembo Operator Blog Post](https://tembo.io/blog/tembo-operator) from October 2023.

## Closing the loop

The control-plane receives state events from the data-plane via the queue. These state events are then persisted to the control-plane’s Postgres database. Additionally, further reconciliation between the user’s desired state of an instance and the actual state of the instance happens here. For certain transitions, when the desired state does not equal the actual state events are resent to the data-plane. In other cases, errors are logged and alerts are triggered.

Stay tuned for Part 2 of this series where we will dive into the data-plane and how we manage Postgres instances in Kubernetes.

![alt_text](p3.png "image_tooltip")

## We’re hiring!

If this sounds interesting and you would like to help us improve our platform, reach out and apply!
