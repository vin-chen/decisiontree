# Flow App Starter

**Notes:** 

1. Apps in this repo are **not production ready**. This repo holds starters and/or hackathon results!
2. **Set the kyma name space!** If you stay with the `.cli.sh` you are fine.
3. If you worked in CEC and did not yet delete your `.npmrc` do it before as you may run into install problems.

## Add a new app
* Clone the `_starter` folder
```
cp -r _starter <location-team-name-or-d-i-c-name-or-app-name>
// example
cp -r _starter wdf-rolls-royce-3d-renderer
```
* Develop the app in its new folder (emit and consume the right events) - like `example`
* Push and make a PR
* Let anyone approve it, we just protect master a bit
___

## Running the application locally
Running the application locally is fairly simple. You will need node version 10.9 or higher to be able to run the application. 
Hint: if you are using older versions of node and need them, have a look at [Node Version Manager](https://github.com/nvm-sh/nvm/blob/master/README.md). If you use MacOS, you can install it with 

```
brew install nvm
```

and then to check, install and switch version on nvm

```
nvm list
nvm install 10.9
nvm use 10.9
```

if you get an error `nvm command not found`, use the command `brew info nvm` and follow the instructions to set the environment for the nvm so it is available from terminal.

Once you have the correct node version in use, use the following command in the application folder:

```
npm install  
npm run start
```

The application will be available on [http://localhost:4200/](http://localhost:4200/). 

Once you make changes to the code, the page is refreshed automatically.

## Playground
### Local
HTTP and HTTPS can not cross. If you test your app locally, you need a local playground.
With the [Playground](https://github.tools.sap/coresystemsFSM/portal/tree/master/tools-flows-playground) you can test your app, clone it, `npm install` it and `npm run start:dev` it.

### Remote
As soon as you deployed your app (on kyma or anywhere else where `https` reigns, you can use the [QT playground](https://qt.coresystems.net/tools-flows-playground/home)).

If you want your app to appear in the dropdown, edit (locally or even with a PR): https://github.tools.sap/coresystemsFSM/portal/blob/master/tools-flows-playground/application/src/app/home/flow-app/flow-app-catalog.service.ts
___
## Deploying the app on kyma Cluster

**Your kube config expires every 8 hours!**.

You need to download a new one and replace the existing.

### Setup the `kubectl` config for deploying on cluster
   - You will need a docker account. If you don't have one, create an account on [www.docker.com](www.docker.com)
   
   - Install Docker desktop for your OS : [https://hub.docker.com/?overlay=onboarding](https://hub.docker.com/?overlay=onboarding)
   
   - login with the credentials
   
   - Check if you have k8s CLI installed. In your terminal/CMD, run the command `kubectl`, if the command output is a list of options available, you have it installed. If you see an output similar to `Command not found`, you need to install the CLI before moving on to the next step.
   
     - To install k8s cli on mac using brew, use the command `brew install kubectl` . For other OS follow the instruction on the following page: [https://kubernetes.io/docs/tasks/tools/install-kubectl/](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
     
   - Download the config for kyma cluster : [https://console.kyma-flows.cluster.extend.cx.cloud.sap/home/settings](https://console.kyma-flows.cluster.extend.cx.cloud.sap/home/settings)
   
   - If you prefer to only have one config file for all your k8s context, you can copy the contents from the above downloaded file into the config file located at `~\.kube\Config` . Copy the Cluster, context and user sections to your k8s config file.
   
   - set the kyma context to current context using the following command ```kubectl config use-context kyma-flows.cluster.extend.cx.cloud.sap```
   
   - Verify if the context in use is the one from kyma `kubectl config current-context`
   
   - Check the pods running in the namespace `hackathon` with the following command `kubectl get pods -n hackathon`
   
   - The token expires everyday, so you will need to download the config file and update the credentials for kyma config in kubectl config.
   

### Deploying the template app on the kyma cluster
   - To deploy the application, you need to adapt the `cli.sh` file based on your credentials.
    
   - Adapt the `REGISTRY_USER_NAME` to use your docker id.
   
   -  Adapt the `APP_NAME` to your app. You can also use the same name as your repository (**It needs to be lowercase and dashes, no other chars.**).
   
   -  Now you are ready to start the deployment. Use the command `./cli.sh pipeline` to deploy your application. If you see any compilation errors, fix them and run the command again to deploy.
   
   -  Once the deployment is successful, you will see an output similar to :
   
      ```sh
        DEPLOY-TO-KYMA==================================
        service/flow-app-template unchanged
        api.gateway.kyma-project.io/flow-app-template unchanged
        deployment.extensions/flow-app-template configured
        DONE=============================================
        app deployed at: https://flow-app-template.kyma-flows.cluster.extend.cx.cloud.sap
        =================================================
      ```
   - use the URL from the output above to access you application running on kyma cluster.
   
___
-
___
-
___
-
___


## Which events to use when?
In order to coordinate with the flow-runtime which is responsible for orchestrating the flows, each application needs to subscribe and publish certain flow-runtime and shell-sdk events.

Check out [fsm-shell](https://www.npmjs.com/package/fsm-shell) npm package for deeper understanding of module.

Below it is described how to use these events and what role each event plays in a flow-app's life cycle.

1. [V1.REQUIRE_CONTEXT](https://github.com/SAP/fsm-shell#V1REQUIRE_CONTEXT) event
  - Publish to this event on **application startup** with the payload similar to
    ```json
    {
      "clientIdentifier": "test-app-client-identifier",
      "clientSecret": "test-app-client-secret",
      "cloudStorageKeys?": "CloudStorageKey[]"
    }
    ```
   Emitting this event notifies the flow-runtime which is running this application in an iFrame, to provide the context required by this app to function. In response to this event, flow-runtime also raises the same event with context in payload.
  - Subscribe to this event on **application startup** to receive the context provided by flow-runtime. You might use these context values as initial values for your application, after all each application is a building block which builds on a foundation from earlier context and contributes to the context needed by flow apps next in the flow.
    ```json
    {
      "user": "Test User",
      "initialContext": [
        {
          "name": "url",
          "value": "https://www.youtube.com/embed/test",
          "type": "string"
        },
        .....
      ]
    }
    ```
2. [V1.CAN_CONTINUE](https://github.com/SAP/fsm-shell#v1flowscan_continue) event
  - Publish to this event as an application once the flow step executed by the application is done and the flow being executed by flow-runtime can continue to the next step. Intermediately this event can be emitted by the application with a falsy value to indicate that application is not yet done and the flow needs to wait before continuing. This event only expects a boolean payload.
    ```javascript
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, false);
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);
    ```

3. [V1.ON_CONTINUE](https://github.com/SAP/fsm-shell#v1flowson_continue) event
  - Subscribe to this event as an application to be notified when the flow-runtime wants to continue to the next step. If the application :
    - can continue, then it should save the tasks if anything needs to be saved. Prepare the output for next steps in the following json structure:
      ```json
      {
        "output": [{
          "name": "name-of-output",
          "value": "result-for-the-output"
        },
          ...
        ]
      }
      ```
      and Publish to V1.ON_CONTINUE event with the above JSON payload.
    - cannot continue, then it should Publish to the event V1.CAN_CONTINUE with a falsy payload to indicate to the flow-runtime that the application is not ready yet to continue.


Note: This template application makes use of all the events listed above in the file `application>src>app>app.component.ts`. Have a look there to understand how these event are used. If you using this template as starting point for your application, don't forget to change the payloads and the conditions on which the events are being triggered.

___
-
___
-
___
-
___

## Setup help

> Instructions for setting up the cluster locally are without any guarantee. Please follow the official documentation from Kyma to solve any further issues.


#### Setup local kyma cluster on macOS**
If you want to tests the applications on a local kyma cluster, you can also install it locally. You can follow the instruction on the official page [Kyma Install Locally](https://kyma-project.io/docs/root/kyma#installation-install-kyma-locally) to learn more about how to set it up. Kyma versions are tightly bound to the versions of the dependency. That's why it is important to match the versions of all dependencies before installing kyma.
```sh
brew install kyma-cli 

brew reinstall hyperkit

curl -LO https://storage.googleapis.com/minikube/releases/latest/docker-machine-driver-hyperkit && sudo install -o root -g wheel -m 4755 docker-machine-driver-hyperkit /usr/local/bin/

curl -LO  https://storage.googleapis.com/minikube/releases/v1.3.1/minikube-darwin-amd64 && sudo install minikube-darwin-amd64 /usr/local/bin/minikube

brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/51dbe1f113d532314633c098a3f5f24b5f1abdfb/Formula/kubernetes-cli.rb

kyma provision minikube

kyma install

Adding domain mappings to your 'hosts' file
- Domains added

Kyma is installed in version:	1.7.0
Kyma is running at:		https://192.168.64.8:8443
Kyma console:			https://console.kyma.local
Kyma admin email:		admin@kyma.cx
Kyma admin password:		**********

Happy Kyma-ing! :)

```

#### Setup local kyma cluster on Windows**
Installing Kyma on windows:
-	Download the version for windows from here https://github.com/kyma-project/cli
-	Extract the zip to a folder named kyma and copy the folder to c:\program files
-	Edit the PATH env variable add this folder to the path c:\program files\kyma
-	Now try to execute kyma as command in console. You should see the help menu from Kyma.
- Enable hyper-v if not already enabled by using the following command in powershell
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```
- download and install the minikube version as recommended on kyma installation page and set hyperv as the default driver
```sh
minikube config set vm-driver hyperv
```
-  Follow the instruction on the blog to create a switch [here](https://blogs.sap.com/2019/06/19/installing-kyma-locally-on-windows-10-the-not-so-hard-way/comment-page-1/#comment-479503) and then provision minikube with following command
```sh
kyma provision minikube --vm-driver hyperv --hypervVirtualSwitch "minikube_switch"
```
- Once the above command is successful, install kyma with the command 
```sh
kyma install
```
- If while installing kyma, you feel that the command is stuck, ctrl + c in the powershell and it should go to the next command.

___
-
___
-
___
-
___


## Troubleshooting

### Deployment failed because of docker permission issues

  If you got following issue on your:

```bash
okDOCKER-CLEAN-UP==================================
WARNING: Error loading config file: /Users/d061665/.docker/config.json: open /Users/d061665/.docker/config.json: permission denied
DONE=============================================
```

  Then run following command `sudo chown $USER ~/.docker/config.json` and try it again.
  
### Your ~/.kube/config expired

```
 unable to recognize "STDIN": the server has asked for the client to provide credentials
```

Go to the [kyma console](https://console.kyma-flows.cluster.extend.cx.cloud.sap/home/settings) and download a new one. Put it carefully into your own.
