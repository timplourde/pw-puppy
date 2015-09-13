pw-puppy
==============
Simple password manager application built with [Electron](http://electron.atom.io).  

It uses all this super cool stuff:

1. [WebCrypto](http://www.w3.org/TR/WebCryptoAPI/) APIs
2. [Electron-Boilerplate](https://github.com/szwacz/electron-boilerplate)
3. [Knockout](http://knockoutjs.com/), [FontAwesome](http://fontawesome.io/), [Skeleton](http://getskeleton.com/) and other libs

# Developing

Node.js is required.  The top-most `package.json` is for building and packaging.  The `app/package.json` is for the application.  If you're having trouble building/running, check the `scripts` section and make sure the path seperators work for your OS (i.e. / or \\).

```
clone this repo
cd [repo-dir]
npm install
bower install
npm start
```

See **electron-boilerplate-readme.md** for more information about the project structure and packaging instructions.

# License

The MIT License (MIT)

Copyright (c) 2015 Tim Plourde

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
