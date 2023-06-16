cd path/to/arrow # replace path/to/arrow with the actual path to the Arrow source code directory on your system.
git fetch
git checkout master
git pull
cd path/to/malibu # replace path/to/malibu with the actual path to your Malibu project directory on your system.
cp -R path/to/arrow path/to/malibu/node_modules # change the path here too

# Restart your Malibu application or rebuild if necessary
