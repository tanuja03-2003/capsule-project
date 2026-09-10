pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    parameters {
        booleanParam(
            name: 'RUN_SECRET_SCAN',
            defaultValue: true,
            description: 'Run Gitleaks when it is installed on the Jenkins agent.'
        )
        booleanParam(
            name: 'PUSH_IMAGES',
            defaultValue: false,
            description: 'Push tagged images to the configured registry.'
        )
        booleanParam(
            name: 'DEPLOY_TO_K8S',
            defaultValue: false,
            description: 'Deploy backend and notification-worker to Kubernetes.'
        )
        string(
            name: 'REGISTRY_HOST',
            defaultValue: 'docker.io',
            description: 'Registry host, for example docker.io or a private registry.'
        )
        string(
            name: 'REGISTRY_NAMESPACE',
            defaultValue: '',
            description: 'Registry namespace or Docker Hub username. Required for push/deploy.'
        )
        string(
            name: 'DOCKER_CREDENTIALS_ID',
            defaultValue: 'docker-registry-credentials',
            description: 'Jenkins username/password credential ID for the registry.'
        )
        string(
            name: 'IMAGE_TAG',
            defaultValue: '',
            description: 'Optional immutable tag. Defaults to BUILD_NUMBER-GIT_COMMIT.'
        )
        string(
            name: 'KUBE_CONTEXT',
            defaultValue: '',
            description: 'Optional kubectl context. Leave empty to use the agent default context.'
        )
    }

    environment {
        LOCAL_IMAGE_PREFIX = 'capstone_event_ticketingandvenueaccess'
        KUBE_NAMESPACE = 'eventhub'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def commit = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_SHORT_COMMIT = commit
                    env.IMAGE_TAG = params.IMAGE_TAG?.trim()
                        ?: "${env.BUILD_NUMBER}-${commit}"

                    if ((params.PUSH_IMAGES || params.DEPLOY_TO_K8S)
                        && !params.REGISTRY_NAMESPACE?.trim()) {
                        error('REGISTRY_NAMESPACE is required when pushing or deploying images.')
                    }

                    env.REMOTE_IMAGE_PREFIX = params.REGISTRY_NAMESPACE?.trim()
                        ? "${params.REGISTRY_HOST.trim()}/${params.REGISTRY_NAMESPACE.trim()}"
                        : ''
                }
            }
        }

        stage('Secrets Detection') {
            steps {
                script {
                    if (!params.RUN_SECRET_SCAN) {
                        echo 'Secrets scan disabled by parameter.'
                    } else {
                        sh '''
                            if command -v gitleaks >/dev/null 2>&1; then
                                gitleaks detect --source . --no-banner --redact --exit-code 1
                            else
                                echo "Gitleaks is not installed; secrets scan skipped."
                                echo "Install Gitleaks on the Jenkins agent to enforce this stage."
                            fi
                        '''
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu
                    for service in backend api-gateway; do
                        if [ -f "$service/package-lock.json" ]; then
                            npm --prefix "$service" ci --ignore-scripts
                        else
                            npm --prefix "$service" install --ignore-scripts
                        fi
                    done
                '''
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                    set -eu
                    npm --prefix backend test
                    npm --prefix api-gateway test
                    node --check notification-service/src/worker.js
                    node --check notification-service/src/redis.js
                    node --check notification-service/src/services/notificationService.js
                '''
            }
        }

        stage('Code Quality') {
            steps {
                sh '''
                    set -eu
                    for service in backend api-gateway; do
                        npm --prefix "$service" run lint --if-present
                    done
                    echo "No repository lint or SonarQube configuration is currently present."
                '''
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def images = [
                        [name: 'api-gateway', context: 'api-gateway', dockerfile: 'Dockerfile'],
                        [name: 'backend', context: 'backend', dockerfile: 'Dockerfile'],
                        [name: 'notification-service', context: 'notification-service', dockerfile: 'Dockerfile'],
                        [name: 'payment-service', context: 'payment-service', dockerfile: 'Dockerfile'],
                        [name: 'venue-access-service', context: 'venue-access-service', dockerfile: 'Dockerfile'],
                        [name: 'service-registry', context: 'service-registry', dockerfile: 'Dockerfile'],
                        [name: 'nginx', context: '.', dockerfile: 'nginx/Dockerfile']
                    ]

                    images.each { image ->
                        sh "docker build --pull -t ${env.LOCAL_IMAGE_PREFIX}-${image.name}:${env.IMAGE_TAG} -f ${image.dockerfile} ${image.context}"
                    }
                }
            }
        }

        stage('Docker Push') {
            when {
                expression { params.PUSH_IMAGES }
            }
            steps {
                script {
                    def images = [
                        'api-gateway',
                        'backend',
                        'notification-service',
                        'payment-service',
                        'venue-access-service',
                        'service-registry',
                        'nginx'
                    ]

                    withCredentials([
                        usernamePassword(
                            credentialsId: params.DOCKER_CREDENTIALS_ID,
                            usernameVariable: 'REGISTRY_USER',
                            passwordVariable: 'REGISTRY_PASSWORD'
                        )
                    ]) {
                        sh '''
                            set +x
                            printf '%s' "$REGISTRY_PASSWORD" | docker login "$REGISTRY_HOST" --username "$REGISTRY_USER" --password-stdin
                        '''

                        images.each { image ->
                            def local = "${env.LOCAL_IMAGE_PREFIX}-${image}:${env.IMAGE_TAG}"
                            def remote = "${env.REMOTE_IMAGE_PREFIX}/${image}:${env.IMAGE_TAG}"
                            sh "docker tag ${local} ${remote} && docker push ${remote}"
                        }

                        sh 'docker logout "$REGISTRY_HOST" || true'
                    }
                }
            }
        }

        stage('Kubernetes Deploy') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    def kubectlContext = params.KUBE_CONTEXT?.trim()
                        ? "--context ${params.KUBE_CONTEXT.trim()}"
                        : ''
                    def backendImage = "${env.REMOTE_IMAGE_PREFIX}/backend:${env.IMAGE_TAG}"
                    def workerImage = "${env.REMOTE_IMAGE_PREFIX}/notification-service:${env.IMAGE_TAG}"

                    sh """
                        set -eu
                        kubectl ${kubectlContext} apply -f k8s/namespace.yaml
                        kubectl ${kubectlContext} apply -f k8s/backend/service.yaml -f k8s/backend/deployment.yaml
                        kubectl ${kubectlContext} apply -f k8s/notification-worker/deployment.yaml
                        kubectl ${kubectlContext} set image deployment/backend backend=${backendImage} -n ${env.KUBE_NAMESPACE}
                        kubectl ${kubectlContext} set image deployment/notification-worker notification-worker=${workerImage} -n ${env.KUBE_NAMESPACE}
                    """
                }
            }
        }

        stage('Rollout Verification') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    def kubectlContext = params.KUBE_CONTEXT?.trim()
                        ? "--context ${params.KUBE_CONTEXT.trim()}"
                        : ''
                    sh """
                        set -eu
                        kubectl ${kubectlContext} rollout status deployment/backend -n ${env.KUBE_NAMESPACE} --timeout=180s
                        kubectl ${kubectlContext} rollout status deployment/notification-worker -n ${env.KUBE_NAMESPACE} --timeout=180s
                        kubectl ${kubectlContext} get pods -n ${env.KUBE_NAMESPACE}
                        kubectl ${kubectlContext} get deployments -n ${env.KUBE_NAMESPACE}
                        kubectl ${kubectlContext} get services -n ${env.KUBE_NAMESPACE}
                    """
                }
            }
        }

        stage('Smoke Test') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    def kubectlContext = params.KUBE_CONTEXT?.trim()
                        ? "--context ${params.KUBE_CONTEXT.trim()}"
                        : ''
                    sh """
                        set -eu
                        kubectl ${kubectlContext} port-forward service/backend 18080:3000 -n ${env.KUBE_NAMESPACE} > backend-port-forward.log 2>&1 &
                        port_forward_pid=\$!
                        trap 'kill \$port_forward_pid 2>/dev/null || true' EXIT
                        sleep 3
                        curl --fail --silent --show-error http://127.0.0.1:18080/health
                    """
                }
            }
        }
    }

    post {
        success {
            echo "EventHub pipeline completed successfully. Image tag: ${env.IMAGE_TAG}"
        }
        failure {
            echo 'EventHub pipeline failed. No destructive Kubernetes cleanup is performed.'
        }
        always {
            archiveArtifacts artifacts: 'backend-port-forward.log', allowEmptyArchive: true
        }
    }
}
