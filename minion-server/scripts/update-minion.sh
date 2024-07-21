echo "Download files from source: $1"
ZIPFILE=~/staging/shaman-cluster-minion.zip
APPDIR=~/apps/shaman-cluster-minion
BACKUP=~/apps/shaman-cluster-minion-backup
STAGE=~/apps/shaman-cluster-minion-stage
STAGE_CONFIG=~/apps/shaman-cluster-minion-stage/minion-server/app/config/app.config.json
APP_CONFIG=~/apps/shaman-cluster-minion/minion-server/app/config/app.config.json

if [ -z "$1" ]; then
  echo "No URL provided!"
  exit 1
fi

# delete existing zip file
rm -f $ZIPFILE

# download zip file
wget -c "$1" -O $ZIPFILE

#ensure zip file downloaded
if [ ! -f $ZIPFILE ]; then
  echo "File not found!"
  exit 1
fi

# remove backup / stage folders
rm -r -f $BACKUP
rm -r -f $STAGE

# copy to stage
unzip $ZIPFILE -d $STAGE

# install dependencies
cd $STAGE
npm install
npm run restore

# copy existing config
rm $STAGE_CONFIG
cp $APP_CONFIG $STAGE_CONFIG

# swap folder
mv $APPDIR $BACKUP
mv $STAGE $APPDIR

echo "Shaman Cluster - Minion Server Update Complete!"