## Configure Wifi Sharing on Primary Node
Run on primary node: 
```sh
sudo nmcli con modify "Wired Connection 1" ipv4.method shared
```

*Ref:* https://forums.raspberrypi.com/viewtopic.php?t=346633

## Turn Off Wifi on Secondary Nodes
Run on secondary nodes: 
```sh
nmcli radio wifi off
```

## Install NVM
To install NVM, run the following command:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

To install node / npm, run the following commands:
```sh
nvm install 20.15.0
nvm use 20.15.0
```

## Setup PM2
Install pm2 using npm command:
```sh
npm i -g pm2
```

## Configure Root Server
Run the following commands to start services:
```sh
pm2 start /home/kbrown/apps/shaman-cluster-root/root-server/bin/app.service.js --name "cluster-root"
pm2 start /home/kbrown/apps/shaman-cluster-root/service-bus/service-bus-api/bin/app.service.js --name "service-bus"
```

Next, run the following command to setup pm2 to run on startup:
```sh
pm2 startup
```
*The above command will ask you to run another command, as sudo user, to finish setup.

Finally, run the following command to save the pm2 app registration:
```sh
pm2 save
```

## Configure Minion Server
Run the following command to start the minion service:
```sh
pm2 start /home/kbrown/apps/shaman-cluster-minion/minion-server/bin/app.service.js --name "9302" -- --port=9302
```
*NOTE:* If you want to connect via url (instead of ip address) you can also provide the argument `--url="http://node1.example.local/"`.

Next, run the following command to setup pm2 to run on startup:
```sh
pm2 startup
```
*The above command will ask you to run another command, as sudo user, to finish setup.

Finally, run the following command to save the pm2 app registration:
```sh
pm2 save
```

## Setup TOR (Raspberry Pi)
Run the following command(s) to install the supporting package(s):
```sh
sudo apt install apt-transport-https
```

Then run the following command to get your OS distribution name (bookworm, buster, etc.); this will be needed in the next steps:
```sh
lsb_release -c
```

Use a text editor to create the file `/etc/apt/sources.list.d/tor.list` and add the following contents:
```sh
deb     [signed-by=/usr/share/keyrings/tor-archive-keyring.gpg] https://deb.torproject.org/torproject.org <DISTRIBUTION> main
deb-src [signed-by=/usr/share/keyrings/tor-archive-keyring.gpg] https://deb.torproject.org/torproject.org <DISTRIBUTION> main
```
*NOTE:* make sure to change <DISTRIBUTION> to the name of your OS distribution.

Run the following commands to install tor (and supporting tools):
```sh
sudo wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/tor-archive-keyring.gpg >/dev/null
sudo apt update
sudo apt install tor deb.torproject.org-keyring --yes
sudo apt install nyx netcat-traditional --yes
```

Next, we need to configure the tor monitor. First, generate a password with the following command:
```sh
tor --hash-password your-password-here
```

Then, open the file `/etc/tor/torrc` and set the following options:
```sh
ControlPort 9051
HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```
*NOTE:* replace the password (starting with 16:) with the password hash from the previous step.

### Automatically Regenerate Exit IP Address
Create the file `/home/kbrown/scripts/reset-tor-circuit.sh` and add the following code:
```sh
#!/bin/sh
(echo authenticate '"K.brown3"'; echo signal newnym; echo quit) | nc localhost 9051
```
*NOTE:* don't foget to make the script executable (`chmod +x`).

Then run the command `crontab -e`, to open a cron file, and enter the following commands:
```sh
* * * * * ( /home/kbrown/scripts/reset-tor-circuit.sh )
* * * * * ( sleep 30 ; /home/kbrown/scripts/reset-tor-circuit.sh )
```

### Testing TOR Access
Run the following command to validate your tor connection:
```sh
curl -v --socks4 localhost:9050 https://check.torproject.org/api/ip
```

### References
https://objsal.medium.com/install-tor-in-raspberry-pi-530115053a1d
https://www.npmjs.com/package/tor-request

## Install and Configure Chromium
If you want to scrape websites that have dynamic content you will need to install and configure "Chromium".

To install Chromium run the following command:
```sh
sudo apt install chromium-browser chromium-codecs-ffmpeg -y
```

Then, in your minion config(s), add the following json property:
```json
"chromiumPath": "/usr/bin/chromium-browser"
```