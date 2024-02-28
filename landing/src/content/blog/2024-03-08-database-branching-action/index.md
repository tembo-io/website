
## What is database branching?

Database Branching allows you to automatically create a forked version of your database for every open Pull Request (PR) on your GitHub repository. This means that for each PR, you get a live, isolated copy of your database as it exists at the time of the PR's creation. Once the PR is closed, the branched database is automatically deleted.

This workflow is great for preview environments and for trying out new Postgres extensions.

## Why use database branching?

Preview environments are essential for testing changes without affecting the production environment, yet setting up separate, realistic databases for backend services has traditionally been a challenge. Database branching simplifies this by automatically deploying a forked database for each PR, enabling isolated testing environments. This approach eliminates the need for shared databases, which can lead to conflicting migrations and junk data, and reduces the reliance on database seeding scripts that often lack the nuance of real-world data.

Moreover, database branching is particularly beneficial for PostgreSQL users. It allows for testing new extensions defined in your `tembo.toml` file in an isolated environment, ensuring compatibility and performance before these changes are made to your production database.

## How we implemented database branching to make it fast

### Faster forking

Faster forking means reducing the time it takes to create a copy of your database for each pull request (PR). This speed is crucial for development velocity, allowing teams to test changes more quickly and iterate faster.

How are we accomplishing this? We optimized the database cloning process by implementing volume snapshots. This approach means that, instead of copying the entire database for each branch, we create the database from the latest snapshot at the PR's creation time and then replay data into the branched database from WAL as needed. This dramatically reduces the forking time.

<!--
This bullet points are to be filled in later once we can have more details on the timings and the process.
-->
* Add more details and timings here once we have them
* for example give timings to restore a 10GB, 50GB and 100GB database (maybe 500GB) once snapshots are fully operational.

How can you use it? This feature is automatically enabled for all users of our GitHub Action. To benefit from faster forking, simply continue using the database branching feature as usual. You'll notice the reduced setup times the next time you open a PR.

### Integration via Github Actions

We've developed a Github Action that will automatically trigger the forking of your database based off how you have your CI job configured. This means that you can continue to use your existing CI/CD pipeline and simply add our Github Action to your workflow.

### How it works
The action takes minimal requires inputs.  You will need your Tembo orginization id, the instance id of the database you want to branch, and your Tembo API token.  You can generate a temporary JWT for use with the action by visiting the [Tembo Cloud JWT Generator](https://cloud.tembo.io/generate-jwt).  You can find your organization id and instance id by looking at the Tembo Cloud URL, 

`https://cloud.tembo.io/orgs/org_2GjOcQXiQhyg6sOfwY9AL76Yv3t/instances/inst_1799344738885_lgEZvW_2`.

Here is an example of how you could use the Github Action in your CI workflow.  This will branch a database when a PR is opened and delete the branched instance when the PR is closed.

```yaml
name: Database Branching Workflow

# Triggers the workflow on pull request events but only for the main branch

on:
  pull_request:
    branches: [ main ]

jobs:

  database-branching:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Set Up Database Branching
      if: ${{ github.event_name == 'pull_request' && github.event.action == 'opened' }}
      id: db-branch-create
      uses: tembo-io/database-branching-action@v1
      with:
        action: create
        tembo-token: ${{ secrets.TEMBO_TOKEN }}
        org-id: org_2GjOcQXiQhyg6sOfwY9AL76Yv3t
        instance-name: branched-pr-${{ github.event.number }}
        instance-id: inst_1799344738885_lgEZvW_2
        tembo-token: ${{ secrets.TEMBO_TOKEN }}

    # Run other pipeline tasks here

    # Step for cleaning up after PR is closed
    - name: Clean Up Database Branch
      if: ${{ github.event_name == 'pull_request' && (github.event.action == 'closed' || github.event.action == 'merged') }}
      uses: tembo-io/database-branching-action@v1
      with:
        action: delete
        org-id: org_2GjOcQXiQhyg6sOfwY9AL76Yv3t
        instance-id: ${{ steps.tembo-branching-action.outputs.instance_id }}
        tembo-token: ${{ secrets.TEMBO_TOKEN }}
```

## Try the action out today

The [Tembo](https://tembo.io) database branching action is available for all users today.  You can try it out for free by signing up at [Tembo](https://cloud.tembo.io). You can get started with the action by adding it to your project by visiting the [GitHub Marketplace](https://github.com/marketplace/actions/tembo-database-branching-action) and by visiting the Github repository [tembo-io/database-branching-action](https://github.com/tembo-io/database-branching-action).  