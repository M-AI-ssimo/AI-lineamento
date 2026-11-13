#!/bin/sh
# Rigenera _worker.js (motore + backend). Da lanciare nella cartella principale: sh tools/build.sh
set -e
{ echo "/* Generato da tools/build.sh: non modificare a mano. */"; cat engine.js; echo; cat tools/worker-src.js; } > _worker.js
echo "_worker.js aggiornato"
