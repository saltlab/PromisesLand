#!/bin/sh

dir_path="../data/subject-systems.txt"
sources_path="$HOME/dev/PromisesLand/subject_systems"

if [ -d $sources_path ]; then
    echo "$sources_path exists. so skipping the rest"
else
    echo "$sources_path does not exist. creating."
    mkdir $sources_path
    cd $sources_path
    echo "Reading URLs from file $dir_path"
    while read p; do
        git clone $p
    done <$dir_path
fi