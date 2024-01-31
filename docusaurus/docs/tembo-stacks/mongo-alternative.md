---
sidebar_position: 10
---

# Tembo MongoAlternative

The Tembo MongoAlternative Stack is designed to bring document-oriented database capabilities to Postgres.
Leveraging the power of FerretDB, Tembo users can both migrate from MongoDB to Postgres, as well as interact with their data as if they never left!

## Apps & Extensions

- [FerretDB](https://docs.ferretdb.io/) - `FerretDB` is an open-source proxy build on Postgres that translates MongoDB wire protocol queries to SQL.
- Extensions from [Trunk](https://pgt.dev/) can be installed on-demand.

## Getting started

### Download mongosh (MongoDB Shell)

Similar to `psql`, `mongosh` is a means to connect and interact with your Tembo instance.
The difference, however, is that `mongosh` is specific to MongoDB-like environments, such as the one that FerretDB provides.

- For macOS, you can run the following brew command: `brew install mongosh`
- For Windows and Linux, please refer to the steps found within the [mongosh official documentation](https://www.mongodb.com/docs/mongodb-shell/install/)

### Setup

Once you've established a Tembo MongoAlternative Stack instance, you will need to download a root SSL certificate.
You can then copy the connection string from the UI and execute it within the terminal having navigated to the directory containing the freshly-downloaded SSL certificate.
As an alternative to copying from the UI, you can fill in and run the following mongosh command:

```bash
mongosh "mongodb://postgres:<your-password>@<your-host>:27018/ferretdb?authMechanism=PLAIN&tls=true&tlsCaFile=$(pwd)/ca.crt"
```

Note that the end of the connection string, `tlsCaFile=$(pwd)/ca.crt`, is pointing to the directory in which your terminal is in when executing the connection string.
This can be changed if you have a specific directory you would like to store your SSL certificate in.


```bash
psql 'postgresql://postgres:<your-password>@<your-host>:5432/postgres'
```

### Load sample data

Once connected, loading and working with data is very simple.

```
{
    "satellites": [
        {
            "name": "NOAA-15",
            "type": "NOAA",
            "launch_date": "2010-08-18",
            "description": "Agent none science nothing."
        },
        {
            "name": "NOAA-18",
            "type": "NOAA",
            "launch_date": "2022-11-23",
            "description": "Win might think."
        },
        {
            "name": "NOAA-19",
            "type": "NOAA",
            "launch_date": "2009-12-08",
            "description": "Government discuss her."
        }
    ],
    "orbit_data": [
        {
            "satellite_name": "NOAA-15",
            "orbit_type": "LEO",
            "altitude_km": 35786,
            "inclination_deg": 47,
            "period_minutes": 1436
        },
        {
            "satellite_name": "NOAA-18",
            "orbit_type": "LEO",
            "altitude_km": 30000,
            "inclination_deg": 88,
            "period_minutes": 1020
        },
        {
            "satellite_name": "NOAA-19",
            "orbit_type": "LEO",
            "altitude_km": 28000,
            "inclination_deg": 55,
            "period_minutes": 1120
        }
    ],
    "observation_data": [
        {
            "satellite_name": "NOAA-15",
            "timestamp": "2019-11-11T06:59:10",
            "temperature": -77,
            "humidity": 97,
            "cloud_cover": 100
        },
        {
            "satellite_name": "NOAA-18",
            "timestamp": "2020-04-15T15:20:30",
            "temperature": 23,
            "humidity": 45,
            "cloud_cover": 75
        },
        {
            "satellite_name": "NOAA-19",
            "timestamp": "2021-08-21T09:10:55",
            "temperature": 19,
            "humidity": 65,
            "cloud_cover": 80
        }
    ],
    "mission_data": [
        {
            "satellite_name": "NOAA-15",
            "objectives": "Study detailed weather patterns.",
            "instruments": ["radiometer", "altimeter"],
            "research_area": "meteorology"
        },
        {
            "satellite_name": "NOAA-18",
            "objectives": "Monitor global climate changes.",
            "instruments": ["spectrometer", "camera"],
            "research_area": "climatology"
        },
        {
            "satellite_name": "NOAA-19",
            "objectives": "Track oceanographic phenomena.",
            "instruments": ["lidar", "thermometer"],
            "research_area": "oceanography"
        }
    ]
}
```

### Sample queries

#### Query 1

#### Query 2

#### Query 3

#### Query 4

#### Query 5
