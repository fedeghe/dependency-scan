# dependency-scan

This package aim to scan your code and discover which extra packages your code is actually relying on.

### Installation  

Install dependency-scan running:
```
    $ [sudo] npm install dependency-scan [-g]
```
### Usage  

_Dependency-scan_ can be started just running into your project folder
```
    $ dependency-scan
```


Scans all files in the current folder tree (excluding `.git`, `.svn` and `node_modules`) and builds a list containing every meaningful required package name.  
**Take care** that, since the search is just done matching for arguments passed to every _require_ function call, the resulting list could contain some names that actually comes from a frontend js. _Dependency-scan_ will try to discover those ones and to notice You if something is found, btw is always at least wise to check the resulting list before compromising the _package.json_ your project **depend** upon.