# Catalyst
**Catalyst** is a Vscode Extension to accelerate the process of solving problems on [Codeforces](https://codeforces.com/). It automatically fetches the problem and displays it, parses test cases, runs and evaluates your code on test cases.
You can edit/add/remove test cases as you like, and when you are done, it can submit your code and then track the submission in realtime.

## Quick Start
![quickStartGif](/readme/CatalystQuickStart.gif)
1. Open any folder in VS code.
2. Press `Ctrl + Alt + P` or use command **Add Problem** from command palette.
3. Enter probelm url from Codeforces and then select language  

After this VS code layout will split into 2 colomns, in left column there will be source code and in right column problem will be displayed with preloaded testcases. In which you can run, evaluate and submit your code.

## Features
* Automatically Fetch Problem from Codeforces and show it in VS code
* Compile, run and evaluate test cases in a single click
* Submit problem right from VS code
* Realtime tracking of submission status
* Encrypts user login credentials using  `AES-256-CBC` and stores encrypted data in the system's keychains, keys for encryption are updated every time user updates its credentials.
* Supported languages
    * C++
    * Python
    * Java

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements
Encrypted Credentials are stored in the system's keychain. On macOS the passwords are managed by the Keychain, on Linux they are managed by the Secret Service API/libsecret, and on Windows they are managed by Credential Vault.  
For Linux depending on your distribution, you will need to run the following command :
* Debian/Ubuntu : `sudo apt-get install libsecret-1-dev`
* Red Hat-based : `sudo yum install libsecret-devel`
* Arch Linux : `sudo pacman -S libsecret`
