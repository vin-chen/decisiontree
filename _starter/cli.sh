#!/bin/bash
set -e

# name of your app 
APP_NAME="flow-app-template"

################ CONFIG TO DEPLOY TO KYMA ##################

# your username on https://hub.docker.com 
# will be used to push your app to docker.io/<username>/<app-name>
REGISTRY_USER_NAME="dominikmeyersap"

# namespace inside kyma to deploy the app to
KYMA_NAMESPACE="hackathon";

# public host name of the kyma cluster 
KYMA_HOST="kyma-flows.cluster.extend.cx.cloud.sap";
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

deploy_to_kyma() {
  echo "DEPLOY-TO-KYMA==================================";

  KYMA_IMAGE=$1;
  KYMA_APP_HOST="$APP_NAME.$KYMA_HOST";

  cat ./deployment/kyma-deployment.yaml \
  | sed "s@replace_me_with_app_docker_image@$KYMA_IMAGE@g" \
  | sed "s@replace_me_with_app_name@$APP_NAME@g" \
  | sed "s@replace_me_with_app_hostname@$KYMA_APP_HOST@g" \
  | sed "s@replace_me_with_app_version@$KYMA_IMAGE@g" \
  | kubectl apply -n $KYMA_NAMESPACE -f -

  
  echo "DONE=============================================";
  echo "app deployed at: https://$KYMA_APP_HOST";
  notify_celebrate;
  echo "=================================================";
}

run_pipeline() {

  notify_start;
  
  # build docker
  build_container;
  
  # push to reg
  push_container $IMAGE;

  # deploy to kyma 
  deploy_to_kyma $REGISTRY_USER_NAME/$IMAGE;
}

notify_start() {
  curl -X POST --data-urlencode "payload={\"channel\": \"#hackathon-notifications\", \"username\": \"$REGISTRY_USER_NAME\", \"text\": \"$APP_NAME started deploying! Yeah!\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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
}

notify_celebrate() {
  curl -X POST --data-urlencode "payload={\"channel\": \"#hackathon-notifications\", \"username\": \"$REGISTRY_USER_NAME\", \"text\": \"$APP_NAME has finished deploying! Check the app at https://$APP_NAME.kyma-flows.cluster.extend.cx.cloud.sap/!\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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
}

cleanup() {

  echo "KYMA-CLEAN-UP==================================";
  echo "delete api $APP_NAME";
  kubectl delete api -l example=$APP_NAME -n $KYMA_NAMESPACE;
  
  echo "delete all $APP_NAME";
  kubectl delete all -l example=$APP_NAME -n $KYMA_NAMESPACE;
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
