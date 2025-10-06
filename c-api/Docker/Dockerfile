FROM node:18

WORKDIR /home/node/cola

COPY --chown=node:node .. .

RUN mkdir -p /home/node/.ssh

RUN mkdir -p dist
COPY external_files/ dist/external_files

COPY ../bitbucket-ssh/id_rsa /home/node/.ssh/id_rsa
RUN chown -R node:node /home/node/.ssh/id_rsa
RUN  echo "    IdentityFile /home/node/.ssh/id_rsa" >> /etc/ssh/ssh_config

RUN npm i
RUN npm i git@bitbucket.org:cola-api/cola-lib.git#master
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start-prod"]
