# vutil #

vREST Utility which provides the following functions:

* Executes a system command via REST API
* Executes a DB query via REST API
* Converts CSV to JSON via REST API
* Fires multipart request
* Reads Text files via REST API

#### Prerequisites:
* Node.js - Download and Install [Node.js](https://nodejs.org/en/download/). You can also follow this wiki (https://nodejs.org/en/download/package-manager/)

#### Setup / Installation

Step by step guide to install vutil:
* Clone / download the vutil repository in the directory of your choice.
  * If you have installed git, then you may clone the repository with the following command: 

    `$ git clone git@github.com:vrest-io/vutil.git`
  
  * OR you may download the repository from github.
* Now, copy the config-sample.json into config.json. 

    `$ cd vutil`
    
    `$ cp config-sample.json config.json`
    
    *Note:* Whenever there is a change in config.json file, then you need to restart the vutil server.
 
* Now, install the dependencies of the vutil module

    `$ npm install`
    
* Now, vutil server is ready to start. Simply execute the following command to start the vutil server. You may change the port number with the following command.
    
    `$ PORT=4080 node server.js`
    
That's it. You may access vutil server on http://localhost:4080. This is also your vutilBaseURL which will be used in vREST test cases.