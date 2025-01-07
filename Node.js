
TO BUILD AND DEPLOY A Node.js APPLICATION USING JENKINS : (FreeStyle)

---------------------------------------------------------

1) Install - Docker, java, git, npm (npm install express), Jenkins - port 8080

2) login to Jenkins

3) Download all required plugins ===> git, Gereric Webhooks, Deploy to Container, npm integration, pipeline-staged
                                   Docker API, Docker common plugin, Docker pipeline, Docker plugin 

4) Create a node ===> no. of executors -2  , directory - var/lib/Jenkins/ , Label - (any name), 
                  launch via SSH - host - public IP of other server , host key verification - non verification strategy
                  availability - Keep this agent online as much as possible

5) Create a Job ===> Build steps -->Execute shell
                       
                       sudo docker build -t node .
                       sudo docker run -d -p 3000:8000 --name abc node (paste this to create a container


6) Creating Webhook to build automatically when ever changes made in GitHub :
------------------------------------------------------------------------------
-> Open Webhook - playload url - (<paste the Jenkins url>/github-webhoook/)

->content type - application/json 

-> Disable (not recommended)

-> Just push the event

-> In Jenkins (GitHub hook trigger for GITScm polling) enable this option 






pipeline script to build and deploy Node.js application :
---------------------------------------------------------


pipeline {
    agent {
        node {
            label 'node' // Replace with the correct label for your Jenkins node
        }
    }
    environment {
        DOCKER_IMAGE = "uday0458/my-nodejs" // Replace with your Docker Hub repository name
        DOCKER_CREDENTIALS = "0ac4a082-c5b2-40cd-8f00-b5672b44b404" // Replace with your Jenkins credentials ID
    }
    stages {
        stage('Clone Repository') {
            steps {
                // Clone the Git repository
                git url: 'https://github.com/Uday0458/my-nodejs.git', branch: 'main'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh "sudo docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }
        stage('Push Docker Image') {
    steps {
        script {
            withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", 
                          usernameVariable: 'DOCKER_USER', 
                          passwordVariable: 'DOCKER_PASS')]) {
                sh """
                echo \$DOCKER_PASS | sudo docker login -u \$DOCKER_USER --password-stdin
                sudo docker push ${DOCKER_IMAGE}:latest
                """
            }
        }
    }
}
 
        stage('Deploy Container') {
            steps {
                script {
                    // Stop and remove the existing container if it exists, then run the new container
                    sh """
                    sudo docker stop my-nodejs-app || true
                    sudo docker rm my-nodejs-app || true
                    sudo docker run -d --name my-nodejs-app -p 3000:3000 ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }
    post {
        always {
            // Clean up dangling images to save space
            sh "sudo docker image prune -f"
}
}
}




1) First we need to login to docker-hub and we need to create a dockerhub repository and the name should be given in DOCKER IAMGE section

2) Then we need to add the Docker-Hub logins details in jenkins Credentials (username-password) and paste in DOCKER_CREDENTIALS section

3) Then paste ur git-hub url in git url section

4) Check the branch (main/master)

5) Create a webhook in github to automactically build new continaer whenever changes takes place
