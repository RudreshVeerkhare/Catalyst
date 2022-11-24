
# Catalyst

[![Version](https://img.shields.io/visual-studio-marketplace/v/RudreshVeerkhare.catalyst)](https://marketplace.visualstudio.com/items?itemName=RudreshVeerkhare.catalyst)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/RudreshVeerkhare.catalyst)](https://marketplace.visualstudio.com/items?itemName=RudreshVeerkhare.catalyst)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/RudreshVeerkhare.catalyst)](https://marketplace.visualstudio.com/items?itemName=RudreshVeerkhare.catalyst)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/RudreshVeerkhare.catalyst)](https://marketplace.visualstudio.com/items?itemName=RudreshVeerkhare.catalyst)

[Catalyst](https://marketplace.visualstudio.com/items?itemName=RudreshVeerkhare.catalyst) is a VS code Extension to accelerate the process of solving problems on [Codeforces](https://codeforces.com/). It automatically fetches the problem and displays it, parses test cases, runs and evaluates your code on test cases.
You can edit/add/remove test cases as you like, and when you are done, it can submit your code and then track the submission in realtime.

## Quick Start

![quickStartGif](https://raw.githubusercontent.com/RudreshVeerkhare/Catalyst/main/readme/CatalystQuickStart.gif)

1. Open any folder in VS code.
2. Press &nbsp;`Ctrl + Alt + P`&nbsp; or use command **Add Problem/Contest** from command palette.
3. Enter problem/contest URL from Codeforces and then select a language

After this VS code layout will split into 2 columns, in the left column there will be source code and in the right column, the problem will be displayed with preloaded test cases. In which you can run, evaluate, and submit your code.

### Shortcuts

`Ctrl + Alt + P`&ensp;- &nbsp;Add new Problem/Contest  
`Ctrl + Enter`&ensp;- &nbsp;Run all test cases for selected problem  
`Ctrl + Alt + H`&ensp;- &nbsp;Hide/Show problem panel

## Features

-   Automatically opens problem statement when source code is opened, so once you add a problem no need to remember URL or name of the problem, Catalyst will do it for you!
-   Automatically Fetch Problem from Codeforces and show it in VS code
-   Can fetch all problems from Contest given contest URL only
-   Compile, run and evaluate test cases in a single click
-   Submit problem right from VS code
-   Realtime tracking of submission status
-   Encrypts user login credentials using &nbsp;`AES-256-CBC`&nbsp; and stores encrypted data in the system's keychains, keys for encryption are updated every time user updates its credentials.
-   Supported languages
    -   C++
    -   Python
    -   Java

## Requirements

Encrypted Credentials are stored in the system's keychain. On macOS the passwords are managed by the Keychain, on Linux they are managed by the Secret Service API/libsecret, and on Windows they are managed by Credential Vault.  
For Linux depending on your distribution, you will need to run the following command :

-   Debian/Ubuntu : &ensp;`sudo apt-get install libsecret-1-dev`
-   Red Hat-based : &ensp;`sudo yum install libsecret-devel`
-   Arch Linux : &ensp;`sudo pacman -S libsecret`

## Note

-   Currently Catalyst doesn't support Interactive Problems on Codeforces
-   Submit option is beta feature so might misbehave sometimes, if you find any issue please report it.
-   If you have any query, you can ask it [here](https://codeforces.com/blog/entry/86720).
