#!/bin/bash
set -e

# name of your app 
APP_NAME="flow-app-template-externals"

################ CONFIG TO DEPLOY TO KYMA ##################

# your username on https://hub.docker.com 
# will be used to push your app to docker.io/<username>/<app-name>
echo "Not setup: Remove this line once you changed APP_NAME and REGISTRY_USER_NAME, you might also need to add a deployment."
exit 0
REGISTRY_USER_NAME="__DOCKER__HUB__USER__"

############################################################

# auto generate some config
GIT_REV="$(git rev-parse --short=9 HEAD)";
TIMESTAMP=$(awk 'BEGIN {srand(); print srand()}');
APP_VERSION="$GIT_REV-$TIMESTAMP";
IMAGE="$APP_NAME:$APP_VERSION";

build_container() {
  echo "DOCKER-CLEAN-UP==================================";
  ((docker images -a | grep $APP_NAME | awk '{print $3}' | xargs docker rmi -f) || :)
  echo "DONE=============================================";

  echo "DOCKER-BUILD=====================================";
  docker build . -t $IMAGE -t "$REGISTRY_USER_NAME/$IMAGE" --build-arg APP_VERSION=$APP_VERSION;
  echo "DONE=============================================";

  echo "DONE=============================================";
  echo "run it locally with:"
  echo "docker run --rm -e PORT=3000 -p 3000:3000 --name $APP_NAME $IMAGE";
  echo "=================================================";
}

push_container() {
  echo "DOCKER-CLEAN-UP==================================";
  docker login;

  [ ! -z $(docker images -q $1) ] || (echo "Error images $1 does not exist" && exit 1);

  docker push "$REGISTRY_USER_NAME/$1";

  echo "DONE=============================================";
  echo "pushed image: $REGISTRY_USER_NAME/$1";
  echo "=================================================";
}

deploy() {
  echo "DEPLOY==================================";
  echo "You can trigger your deployment here, nothing has happened for now.";
  echo "=================================================";
}

run_pipeline() {
  # build docker
  build_container;
  
  # push to reg
  push_container $IMAGE;

  # deploy to kyma 
  deploy $REGISTRY_USER_NAME/$IMAGE;
}

cleanup() {
  echo "DONE=============================================";
  echo "Cleaned up.";
  echo "=================================================";
}

pring_usage_and_exit (){
  echo "[Error] unknonw command";
  echo "";
  echo "try:";
  echo " ./cli.sh pipeline";
  echo " => will do [build]->[push]->[deploy] chained";
  echo "";
  echo " ./cli.sh build";
  echo " =>  will build docker container "
  echo "";
  echo " ./cli.sh push <image>";
  echo " => will push <image> to docker registry"
  echo "";
  echo " ./cli.sh deploy <image>";
  echo " => will deploy <image> to kyma"
  echo "";
  echo " ./cli.sh cleanup";
  echo " => will cleanup (=delete) your deployed app from kyma";
  echo "";
  exit 1;
}

case $1 in
     pipeline)
          run_pipeline;
          ;;
     build)
          build_container;
          ;;
     push)
          push_container $2;
          ;;
     deploy)
          deploy_to_kyma $2;
          ;;
     cleanup)
          cleanup;
          ;;
     *)
          pring_usage_and_exit;
          ;;
esac
