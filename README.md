![microStudio](static/img/microstudio_title_image.png)

microStudio is a free, open source game engine online.
It is also a platform to learn and practise programming.

microStudio can be used for free at https://microstudio.dev

You can also install your own copy, to work locally or on your own server
for your team or classroom. You will find instructions below.

# 3 ways to use microStudio

### Online service
microStudio is available online at https://microstudio.dev ; this is the simpler and the preferred way, you will have access to all the online collaboration features, online publishing and more export features. You don't even need to create an account, you can start working as a guest.

### Standalone application (offline)
Using the standalone, offline app ; download it in the Releases section of this repository, or on itch.io: https://microstudio.itch.io/microstudio ; helpful if you plan to use it in an environment without connection to internet.

### Set up your own microStudio server
You can clone this repository and start your own microStudio server, for a team or a classroom for example. See instructions below:

* Install Node JS (downloads and instructions: https://nodejs.org/en/download/)
* `git clone https://github.com/pmgl/microstudio.git`
* `cd microstudio`
* `git clone https://github.com/pmgl/microstudio.wiki.git`
* `cd server`
* `npm install`
* `npm start`
* Open browser on `http://localhost:8080`

For active development use:
* `npm run dev` instead of `npm start`

### Configuration
To use specific configuration options, create a JSON file `config.json` in the root folder (same folder as this README.md).
You can find partial examples in this folder as config_local.json and config_prod.json.

#### Configuration options

|option|description|
|-|-|
|realm|`"local"` or `"production"`|
|run_domain|The run domain if you are running this in production ; must include protocol (e.g. `"https://microstudio.io"`)|
|dev_domain|The dev domain if you are running this in production ; must include protocol (e.g. `"https://microstudio.dev"`)|
|delegate_relay_service|set to true if you are running a separate relay server for the microStudio Networking features|
|relay-key|a secret key to use with the delegated relay service|
|default_project_language|The default language selected when a user creates a project. Can be set to `"microscript_v2"` (default), `"microscript"`, `"javascript"`, `"lua"` or `"python"`|
|tutorials_root_url|Sets a different URL for loading your own set of tutorials (note: if you use this option, in the toc.md, you must specify a complete URL with domain name for each tutorial)|
|brython_path|Sets a path to a custom folder for the Brython lib|
