HOST = 10.11.12.145
REQUIRED_FILES = package.json server.js monitor.js src builtAssets

deploy:
	# the disable-copyfile flag excludes OSX resource forks from the tarball (._filename)
	tar --disable-copyfile  -cf - $(REQUIRED_FILES) | ssh pi@$(HOST) "cd jetpets; tar xvf -"
