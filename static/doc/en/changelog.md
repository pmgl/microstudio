## Changelog

### Update 2023-12-05
* Project export now includes date an time in file name (thx HomineLudens!)

### Update 2023-11-20
* Text assets (TXT, CSV, OBJ, JSON, MD) can be edited in microStudio
* Support for markdown (.MD) asset files
* Added types Example and Template to create project dialog box
* Fixed Python not working since last update (incompatibility with Brython 3.12.0 to be investigated later)
* Removed old documentation files from the project

### Update 2023-11-13
* New help section: "Examples"
  * Available under Tutorials / Examples https://microstudio.dev/tutorials/examples/
  * Search and find simple examples
  * Run and modify the examples within the help page, no need to clone the projects
  * Guidelines for producing your own examples: https://microstudio.dev/documentation/Creating-Examples/
* New function `sprite.setFPS()` (doesn't break the animation phase)
* Fixed #206, draw map on Image

### Update 2023-09-25
* added missing keyword "global" to syntax highlighter (contributed by @HomineLudens :-) )
* added drawing functions, thanks a lot to @TinkerSmith for providing the initial experiment
  * screen.drawArc()
  * screen.fillArc()
  * screen.drawQuadCurve()
  * screen.drawBezierCurve()
  (functions work on the Image class as well)

### Update 2023-07-04
* You can now choose Babylon.js versions 4, 5 or 6
* You can now choose Pixi.js versions 6 or 7
* You can now choose Matter.js versions 0.17, 0.18 or 0.19
* Fixed time machine

### Update 2023-06-13
* Fixed race condition bug when launching tutorials
* Fixed confirm dialog not showing when deleting a file with project in fullscreen mode
* Fixed problems caused by text selection being enabled in fullscreen mode

### Update 2023-05-22
* Sidebar auto-collapses in mobile portrait mode
* Splitbar can now go vertical in sprites, maps and doc tabs
* Fixed code editor wrong cursor positioning when zoomed out on mobile
* more UI improvements on mobile (project settings, explore, project list)


### Update 2023-05-16
* Sprite editor brush size improvement (even values now possible like 2x2, 4x4)
* New sprite editor brush shape setting: round or square
* New project types:
  * Example: project is very short and made for illustrating a specific point
  * Template: a working game with placeholder graphics, configurable and extensible code.
* microStudio responsive UI improvements:
  * code section automatically rearranges windows in portrait mode
  * main toolbar is now fully responsive, with burger menu
* Added Discord button in the main toolbar
* Fixed #196 (help window visibility bug)

### Update 2023-04-24
* Allow to open project in new tab, closes #135
* land on enabled tab when opening project, closes #192
* show projects storage usage, closes #185
* correct syntax highlighter in explore view, fixes #197
* Account deletion procedure ; stay away from it! ;-)
* Added player_extra_js config option

### Update 2023-04-13
* PIXI: setting resolution to devicePixelRatio

### Update 2023-03-13
* Enabled video and audio capture in Run View

### Update 2023-03-02
* Fixed #171, Image.setTranslation first call ignored

### Update 2023-01-23
* Fixed Python bad error reporting #187

### Update 2023-01-16
* Fixed Image.drawPolyline, Image.drawPolygon, Image.fillPolygon, #186
* Implemented `system.update_rate` writable property, #188

### Update 2022-12-19
* `playing_sound.getDuration()`
* New language: Spanish! Thanks a lot to Jose Consuegra for their contribution!
* Sprite max size changed to 1024x1024
* Fixes #180, Disable import of files from same project (contributed by @HomineLudens)
* Fixed Python project exports
* Added warning messages for oversized files (contributed by @HomineLudens)
* microScript: default argument values now used only if no argument is passed
* microScript: new variable `arguments` provides the list of arguments passed to the function

### Update 2022-11-28
* Color picker gamma correction (better lightness range)
* microStudio PWA app is now fullscreen
* added fullscreen button for project view

### Update 2022-11-04
* Export your game Server as a NodeJS app

### Update 2022-10-27
* Networking features now supported as well in Python, Lua, JavaScript
* Added config option default_project_language
* Added config option tutorials_root_url
* fixed tutorial UI issue (e.g. First Project)

### Update 2022-10-25
* Networking (beta)!!!
  * create multiplayer games
  * run and test everything from the microStudio editor, nothing to install

### Update 2022-10-05
* Fixed `for in` wrong behavior on number / zero (ms 2.0)
* JavaScript execution change unlocks the VM JIT
* Networking core functions implemented and working (but not useable yet ;-))
* Added achievements for Jam \#3

### Update 2022-09-26
* Public projects are marked in projects list and project workspace
* Sprite editor: continuous strokes #163, draw straight lines with `Shift`
* Fixed image.drawImagePart #164
* Undo / redo map resize, fixes #162
* Prepared Python support for Brython's upcoming update, allowing better info on runtime error
* Fixed bug with `for in` when array is sparse (microScript 2.0)
* Prepared server mode window + refactoring
* Prevent splitbars from remembering their position when they are closed
* Updated `marked` lib to 4.1.0

### Update 2022-09-13
* Fixed time machine recording function values, preventing live code updates in ms 2.0
* standalone visibility fixes

### Update 2022-08-30
* Fixed bug with locals in if/else (microScript 2.0) #156
* Fixed bug with captured outer locals being overwritten by block locals (microScript 2.0) #151
* Added warning when using a variable assignment in a condition (e.g. `if i=1 then ...`) #154

### Update 2022-08-25
* added change password feature
* fixed animated sprites outline in maps, closes #153
* Correct export of embedded JS, fixes #146
* also fixed in previous hot updates:
  * do not reset object transform on resize #148
  * fixed typo in image.setRGBA
  * file view rejects drop of plain text, fixes #152
  * fixed ui bug on FireFox, closes #150
  * allowing to set options to project created by tutorial

### Update 2022-07-04
* reduced the number of lines in live help suggestions
* attempt at providing correct permissions for autoplay, gamepad and midi for run window iframe
* Project moderation was made a global config option
* HTML cleanup

### Update 2022-06-21
* New variable `global` in embedded JavaScript snippets, holding the microScript global context
* Generic progress bar is displayed when the project is loading
* thread stored in local variable can reflect on itself #129

### Update 2022-06-16
* New project synchronization feature, accessible from the new project tab "Sync"
  * You have a public project A that you consider "released" but want to update from time to time.
  * Clone your project A ; let's call the clone B
  * work on project B without worrying to break anything in your public project A (which remains untouched for now)
  * once you have a solid new version of B, open project A and activate the tab "Sync"
  * in tab Sync (of project A), select B as synchronization source
  * review the list of changes and proceed ; your project A has pulled all the changes you made to B

### Update 2022-06-14
* `screen.setDrawRotation()` and `screen.setDrawScale()` do not affect `screen.drawLine()`, `screen.drawPolyline()`,
`screen.drawPolygon()` and `screen.fillPolygon()` anymore.
It makes more sense like this, as the initial choice to make them affected was made because of the lack of `screen.setRotation()` and
`screen.setScale()` ; these two functions have since been added.
If you used `screen.setDrawRotation()` or `screen.setDrawScale()` to affect drawing lines and polygons in one of your projects,
this update might break it.

### Update 2022-06-07
* Publishing to Explore section made more friendly and allows screening clones and empty projects
* Improved microScript 2.0 warning reporting when live coding

### Update 2022-06-01
* Libraries reloaded! You can now browse and import libraries to your project in one click
* Embed JavaScript code in your microScript app or library
* new triple double-quote string delimiter: `"""some text"""` (useful for embedding JavaScript)
* some auto-indent improvements for microScript 2.0
* Fixed #138 (too many 'end' did not raise an error)

### Update 2022-05-23
* Plug-ins! Create your own plug-ins or just use community plug-ins for your project
* `system.file.load`: open file dialog and let user load a file
* `system.file.dropped`: check it to see if the user dropped a file to your app.
* Added Discord link on forum #108
* Fixed periodic threads extra cycles #130
* Fixed inputs update when update() is sliced, #109

### Update 2022-05-13
* Project Access API: create and manage project files programmatically
  * `system.project.listFiles()`
  * `system.project.readFile()`
  * `system.project.writeFile()`
  * `system.project.deleteFile()`
(see: https://github.com/pmgl/microstudio/wiki/en-API-cheatsheet#project-access-api)
* Fixed #128 storage.set broken in Lua / Python / JS
* Fixed bug when changing language of an existing project
* Fixed impossible to move map from folder to root
* Fixed ms 2.0 bug when calling `super` and no super class is found
(https://microstudio.dev/community/bugs/offline-version---crash-ide-page/390/)

### Update 2022-05-09
* Now remembering splitbar positions #119
* `screen.drawSprite`: size can be omitted, will default to sprite size #120
* Fixed storage space allowance when upgrading guest to user #122
* Fixed #126 (project icon could be deleted)

### Update 2022-05-03
* **Folders!** ... now in all project tabs!
* Sprite editor customizable background color
* Sprite editor displays drawing coordinates
* Map and sprite editors display a code snippet tip.
* **Support for animated tiles in your maps!**

### Update 2022-04-25
* reworked Explore section, now correctly shows and queries all public projects (#66)
* added tip for markdown support in project description (#77)
* added warning when attempting to overwrite API globals (#101)
* added noscript message for visitors with JavaScript disabled
* mouse wheel events through `mouse.wheel` (-1 O or 1) (#70)
* fixed default language for all projects prior to october 2021
* Public project: added First Published date and Last Modified date (#103)
* fixed coordinate problem with Image.drawPolygon

### Update 2022-04-14
* offscreen images, sprites, sounds
* save image, sprite, or JSON object to file
* ms 2.0 fix: auto-close parentheses

### Update 2022-04-11
* microScript 2.0 is now the default language for new projects!
* documentation is now hosted on the Github wiki
* HTML5 export: JavaScript - microScript interoperability
* Fix: lock code editor when loading project
* Fixed sound.stop()
* many fixes related to microScript 2.0

### Update 2022-04-04
* microScript 2.0 beta
  * fixed local.type
  * Prototype for core types
  * function.bind
  * operator overloading
* random.clone() (to be documented)
* Fixed #97 and #98
* Fixed asset_manager interface

### Update 2022-03-23
* microScript v2: variable.type
* microScript v2: multi-line comments
* microScript v2: binary ops
* microScript v2: system.preemptive flag
* do not reset screen transform when window is resized
* Fixed #95
* Reduced upfront microStudio website download (to be continued)

### Update 2022-03-16
* microScript v2: Threads are working!

### Update 2022-03-14
* screen space rotation and scaling: screen.setScale() and screen.setRotation()
* Fixed #94 paste text into console
* slight Time Machine UI improvement (and fixed #93)
* Time Machine looping now replays recorded user inputs
* microScript v2 fixes

### Update 2022-03-11
* Time Machine: go back in time and fix your code in the past!
  * Start recording
  * Rewind your game, replay past parts, see changes on screen and in the Watch window
  * Restart playing from a past point in time
  * Play in a loop while you adjust your code in realtime
  * works only with microScript ; also restricted to projects using the core graphics API for now
* Frame by frame: hit pause and then the step forward button to run your program frame by frame
* Improved labelling of classes and object instances in the Watch window
* Fixed a laughable bug with 60 fps stability optimization

### Update 2022-03-08
* Watch variables! There is a brand new, feature-rich variable watcher!
  * see variables change in realtime
  * explore and track values in deep data structures (objects and lists)
  * change values on the fly
  * works for microScript v1 (interpreted or transpiled) and v2

### Update 2022-03-04
* Fixed fast forward bug when pressing play several times
* New API features on `system`:
  * system.fps
  * system.pause()
  * system.exit()
  * also documented system.prompt(), system.say(), system.inputs and system.language

### Update 2022-02-25
* Asset Manager! Activate the tab for your project, then import your text files (TXT and CSV), JSON data, fonts (TTF), 3D models (GLB and OBJ)
* Sprite editor toolbar fixes by @Karlmolina (thanks!)
* microScript editor indentation fix by @Karlmolina (thanks!)
* microScript v1 interpreted now also supports native callbacks (useful when passing callbacks along to Babylon.js or other libs)
* Improved help window layout (preventing it from hiding code) #84
* Fixed #74 and #81

### Update 2022-02-07
* Flip and rotate sprite selection! Thanks to @HomineLudens for providing an initial implementation
* Fixed wrong mouse inputs after system.prompt()
* microScript v2 pre-alpha! It is very early though, don't check this one unless you are very curious. Most of the new features promised for v2 aren't there yet as I first focused on making all microScript v1 work on the new engine. Still, most of the hard work is done, what remains to be done is about 20% of it all.
* Fixed deletion of non-empty folders
* Fixed #79

### Update 2022-01-31
* Folders in sounds and music tabs
* Project tabs will now scroll if your window / screen height is limited
* Fixed bugs #76 #59 #73 #75 and #78, see https://github.com/pmgl/microstudio/issues?q=is%3Aissue+is%3Aclosed

### Update 2022-01-18
* Fixed project search filter broken when there are pending invitations
* Set correct page title / description / twitter+facebook card image on public project links
* Translation Fixes
* Fixed incorrect transpiler output for while loops

### Update 2021-12-22
* Fixed parser bug: `//` enclosed in a string was parsed as a line comment

### Update 2021-12-17
* Split bars now react to touch events
* You can draw sprites on touch screens
* You can paint maps on touch screens

### Update 2021-12-16
* Improved the presentation of projects, allowing to use a screenshot as poster image
* Easily take screenshots of your running program with the camera button
* Set your screenshot as project poster image in one click
* Removed and replace PixelatedImage

### Update 2021-12-14
* QR code display to easily run project on mobile!
* Improved error reporting for Python language
* Improved error reporting for JavaScript language
* Choose project type from app, library or tutorial
* Set project options on project creation (type, language, graphics API, optional libs)
* Fixed user public page access when nickname has underscores
* Fixed doc tab not updating when switching from one project to another
* Added JimB007 examples to Babylon.js documentation
* Added link to Github and Patreon on homepage
* Fixed Execute button on user public page for projects of type tutorial
* removed fullscreen to Community PWA manifest

### Update 2021-12-07
* Fixed broken console window after last update
* Fixed undo pollution by using `editor.setReadOnly(true)` when away from code or doc tab
* Implemented M3D.PointLight (thanks to HomineLudens)
* Custom confirm dialogs to prevent standalone app focus problem

### Update 2021-12-02
* microScript: Hot reloading of classes: Changing your class while the program is running will affect all already instanciated objects!
* microScript: Fixed transpiler parent class linking at runtime
* New languages!!! Pick your desired programming language in the project options. You have access to the whole standard microStudio APIs and all optional libs (Pixi, Babylon, Matter.js ...) from your code in Python, JavaScript or Lua. Enjoy all the microStudio goodness: live coding, visual screen positioning help, contextual help and of course export to all target platforms, whatever the language or the optional libs.
* New language: Python!
* New language: JavaScript!
* New language: Lua!

### Update 2021-11-25
* Using interpreter or transpiler is now an option of your project
* You can thus now publish, export HTML5 or export to any target with transpiler active!
* Fixed transpiler bug when functions are called with omitted arguments
* Fixed cache interference when relaunching project

### Update 2021-11-23
* Fixed a bug with transpiled `for..in` loops
* Updates and fixes to the IT doc and tutorials (thanks @HomineLudens)

### Update 2021-11-19
* Experimental features activated! (check "Experimental" in your user settings to get access):
  * Alt graphics API PIXI.js (accelerated 2D)
  * Alt graphics API Babylon.js (Full 3D API!)
  * Alt graphics API M2D (simple accelerated 2D API, preview, built on PIXI.js)
  * Alt graphics API M3D (simple 3D API, preview, built on Babylon.js)
  * optional libs: matter.js (2D physics API) and cannon.js (3D physics API)
  * bonus experimental feature: sound synthesizer preview (requires a MIDI keyboard and Chromium-based browser)

* You can now mark your public projects "unlisted", allowing to share them without having them published on the main Explore page

### Update 2021-11-05
* microStudio standalone app! Download on:
  * https://microstudio.itch.io/microstudio
  * or https://github.com/pmgl/microstudio/releases

### Update 2021-10-26
* Text input/output for the color picker (thanks to HomineLudens for his initial contribution of this feature!)
* Added `screen.loadFont()` and `screen.isFontReady`, allowing to deal with asynchronous loading of fonts
* Synchronous translation data, fixes translation problems in the UI
* translated publish options titles

### Update 2021-10-12
* Fixes for achievements
* Support for Ctrl+S shortcut for saving changes
* Improved color contrast between active line vs selected text
* Hide notifications automatically after 12 seconds

### Update 2021-10-08
* User statistics and achievements!
  * track how many lines of code you wrote, how many pixels you drew and more!
  * receive XP points for working on your microStudio projects and level up!
  * Be rewarded by unlocking achievements (already 43 achievements to unlock, more to come!)
  * Compare your stats and achievements with other users by visiting their profile page

### Update 2021-09-27
* Fixed code editor collapse / expand for class and object blocks
* Fixed transpiler inconsistency (as reported here, thanks to @Abr00 https://microstudio.dev/i/Abr00/transpilerdetection/)
* Map flood fill tool (use shift+click) ; thanks to HomineLudens for providing the base implementation
* Maps now have a proper `name` field (fixes an inconsistency with what is said in the doc)

### Update 2021-09-18
* Enabled Italian language! Special thanks to @HomineLudens ; translation is still a work in progress, you will see it improve in the coming days
* Incorporated tutorials to the Github project ; they are working when running a local version of microStudio offline. They will also be easier to translate to other languages.

### Update 2021-08-18
* Orientation and aspect are now set when importing a project
* Fixed bug: impossible to explore a public project page once it leaves the top 300
* Added links to explore a user's public projects when visiting their public page

### Update 2021-07-22
Special thanks to @FeniX for doing most of the hard work for this update
* Export your project (creates a ZIP archive which can serve as backup or to transfer the project to another install of microStudio)
* Import a project (from a previously exported ZIP archive)

### Update 2021-07-15
* microStudio is now officially open source! Check https://github.com/pmgl/microstudio
* auto-focus title field when creating new project
* empty title field after project is created
* slight UI fixes
* added several npm run scripts

### Update 2021-06-30
* slight UI refresh (see home page and project pages!)
* Profile image and profile description (/bio) ; note that the profile pic does not show everywhere yet, will be improved soon
* Improved public user page (still in progress too, more to come)
* Prepared gamification features (nothing available yet)
* Fixed `a.b += "word"` not working correctly when `a.b` was previously set to `""`
* Fixed setLineWidth not coming up as a suggestion in the code editor

### Update 2021-06-21
* map editor: you can choose a background color (just affects visualization in the editor)
* map editor: you can display another map underneath your current map being edited. Useful if you use maps to create multiple layers of information for your game.
* map editor: now displays the coordinates of the block pointed at.
* sound playback: new property to check if sound playback is over: `sound.finished`
* `continue` keyword is now properly highlighted in code editor

### Update 2021-06-14
* Fixed bug: sounds not working in Android / APK builds

### Update 2021-06-10
* Android builder

### Update 2021-06-04
* Storage tiers boosted! free: 20->50 Mb ; pixel master: 50->200 Mb ; code ninja: 200->400Mb
* Refactoring continued, new internal backup system

### Update 2021-05-31
* added `sprite.getFrame()`
* Big refactoring work, anticipating server migration and open-sourcing

### Update 2021-05-11
* Fixed bug when calling `screen.drawPolygon` and `screen.fillPolygon` with array
* `screen.drawPolygon` now automatically closes path
* Added `screen.drawPolyline` to draw a path without closing
* Added `screen.setLineDash`to define a dash line style for all subsequent drawing operations
* Added all compositing modes available in HTML5 Canvas (see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation ), to be used with `screen.setBlending(...)`
* Added missing documentation for `setBlending`

### Update 2021-05-04
* Removed undefined variable warning when parent class not resolved at loading time
* Improved upload retries, lowered websocket keep alive (ping) periodicity
* Added `system.say(text)`

### Update 2021-04-29
* Transpilation can now be activated as an option (alpha status)
* Fixed sprites thumbnails not synchronizing when receiving updates from server

### Update 2021-04-15
* You can now watch forum categories / forum posts (receive notifications by e-mail)
* Fixed microStudioCeption bug: https://microstudio.dev/community/bugs/accessing-my-project-inside-my-project/99/
* Fixed the project slug field annoyingly resetting while you are typing (project options)

### Update 2021-04-07
* Fixed bug in the render chain when sprites are filtered out by the web client (e.g. by ad blocker)
* Sounds / music can now start playing without clicking in runtime window

### Update 2021-03-25
* Embed microStudio apps in your forum posts and replies

### Update 2021-03-23
* Fixed code editor clipping bug after collapsing / expanding file list
* Text search feature in Community
* Sort posts by activity, likes, views, replies or creation date
* A new search field helps filtering your own project list.

### Update 2021-03-22
* Fixed bug in microScript ; when using return statement from ```for ... in``` loop, return value was not correct

### Update 2021-03-20
* Fixed issue causing posts and replies to be sent multiple times in the forum.

### Update 2021-03-12
* Like posts and replies in the Community forum
* support for (externally linked) images in community posts and replies

### Update 2021-03-09
* microStudio Community dark mode
* microStudio Community can be installed as a PWA app

### Update 2021-03-08
* release of microStudio Community!

### Update 2021-03-03
* New function ```screen.drawTextOutline()```
* Screen clear color: ```screen.clear(color)```
* added support for Android maskable app icons

### Update 2021-03-02
* New function ```list.sortList(compareFunction)```

### Update 2021-02-19
* You can now create and share your own interactive microStudio tutorials
* Launch a custom tutorial from a URL
* View built-in tutorials source code
* fixed regression, sprite thumbnail not updating after renamed
* fixed regression, map thumbnail not updating after renamed
* fixed bug: public user page not scrollable

### Update 2021-02-01
* Sounds! Drop your wav files into your project and play them from your code
* Music! Drop your mp3 files into your project and play music from your code
* Added options to enable / disable warnings in the console
* Temporary fix for disappearing public projects (limit raised from 100 to 300 projects, will now rework that page)
* New split bar when opening a public project from the Explore section

Note about sounds: when exporting a project to HTML5, the sounds can only play when the page is hosted on a HTTP server ; sounds will not play when the page is opened with the file:// protocol.

### Update 2021-01-21
* Issuing warning when using an undefined variable
* Issuing warning when assigning property to an undefined variable / property
* Issuing warning when making a function call on something that isn't a function
* integrated translations of the documentation (loaded directly from Github repository: https://github.com/pmgl/microstudio-documentation)

### Update 2021-01-13
* activated new languages Polish and German! Thanks to contributors FeniX and TinkerSmith who will start working on the translations!
* label sprite frames from zero in the sprite editor
* fixed server crash case caused by messages buffering

### Update 2020-12-17
* New map editor split view allowing to enlarge your tileset
* You can also zoom in/out your tileset with the mouse wheel and move the view by holding the spacebar
* Fixed bug with continuous gamepad triggers LT and RT

### Update 2020-12-10
* code editor: You can now change the font size
* code editor: Search button to find string in code (you can also use Ctrl+F)
* Your Patreon badge is now displayed with your username in the public projects and comments
* assign all kind of property names when creating an object, with double quotes:
```
myobj = object
  x = 1
  "-this doesn't need to be a legal identifier-" = 2
end
```
* you can also use quotes to access a property name which isn't an identifier ```myvar."-this isn't even an id-"``` or ```keyboard.press."("```
* You can now see the byte size of your project files (project settings tab)
* Gamepad triggers (B6 and B7) are now continuous (range from 0 - released to 1 - fully pressed)
* Fixed a bug with cloning a project adding a *main* source file with default draw, update, init, when the cloned project doesn't have a *main* file

### Update 2020-11-28
* Fixed parser bug when two comment sequences ```//``` are on the same line
* Documented ```break``` and ```continue``` statements for loops

### Update 2020-11-26
* Store data permanently and reload with ```storage.set( name , value )``` and ```storage.get( name )```
* Clone your own private project in a click
* New string functions: ```split```, ```lastIndexOf```, ```toLowerCase```, ```toUpperCase```
* Cursor location now saved when switching from a source code file to another
* Predefined "boolean" constants ```true = 1``` and ```false = 0```
* Fix: cloned map wasn't automatically updated and seemed empty when drawn on screen
* Fix: liking a public project used to toggle like on other opened projects in the same session
* Fix: documentation: touch.touches and not touch.keys
* Documented ```screen.setCursorVisible()```

### Update 2020-11-18
* documented screen.clear()
* New trigonometry functions in degrees (sind,cosd,tand,asind,acosd,atand,atan2d)
* Added missing function ```tan()```
* you can now test ```keyboard.press.<KEY>``` or ```keyboard.release.<KEY>``` to check whether a key was just pressed or just released
* you can now test ```gamepad.press.<BUTTON>``` or ```gamepad.release.<BUTTON>``` to check whether a gamepad button was just pressed or just released
* you can now test ```mouse.press``` or ```mouse.release``` to check whether the mouse button was just pressed or just released
* you can now test ```touch.press``` or ```touch.release``` to check whether a finger just hit or left the screen
* New list function ```list.insertAt(element,index)```

### Update 2020-11-02
* new feature screen.setTranslation( tx, ty )
* new feature screen.setDrawAnchor( ax, ay )
* new feature screen.textWidth( text, size )
* fixed code editor sizing problem when folding / unfolding file list
* fixed Ctrl valuetools on FireFox (now do not hold Ctrl, just press once)
* fixed screen.clear() when alpha != 1

### Update 2020-10-23
* introduced ```screen.setCursorVisible(visible)``` to show / hide the mouse pointer
* fixed a problem with classes inheritance ; the parent class is now correctly resolved, even if defined after the child class or in another file.

### Update 2020-10-05
* microScript now supports object-oriented programming, through classes, instantiation and inheritance ; see paragraph Classes in the documentation
* Mouse cursor now disappears from game window if it doesn't move

### Update 2020-09-21
* You can now use browser's back and forward buttons to navigate in microStudio internal pages

### Update 2020-09-10
* Reworked operations on lists and added missing documentation ; see "Operations on lists" in the documentation

### Update 2020-07-06
* Detachable Run window
* Improved sprites and maps editor views with customizable splitbar
* changes to sprites or maps now immediately reflected on Run window, without delay

### Update 2020-06-25
* Export an app for Windows, macOS or Linux in one click. The cloud builder is fully operational (still in beta though).

### Update 2020-04-13
* Remote builder system (will allow to introduce app exports for Windows, macOS, Android... very soon)
* Improved Hot sorting of public projects
* Improved capture of keyboard focus by the app when it starts

### Update 2020-04-03
* Added color palette tool in sprite editor ; palette builds automatically and can be locked / unlocked
* When creating a map, you can now pick individual tiles from a larger sprite used as tilemap.
* Added opacity parameter to fill tool in sprite editor.

### Update 2020-03-30
* All 22 tutorials translated into French
* Minifying Tutorial window improved

### Update 2020-03-25
* Finished 22 tutorials in English, in 4 series: Tour, Programming, Drawing, Create a game

### Update 2020-03-10
* Animated sprites! Click "Animation" button when editing a sprite to create animation frames.
* New public project sorting options, tags and search.

### Update 2020-02-19
* Sprite editor now has a zoom feature (mouse wheel or zoom buttons)
* Blending modes (beta, not official yet nor documented) ; try ```screen.setBlending("additive")``` or ```screen.setBlending("normal")```

### Update 2020-02-17
* Fixed live value sliders messing up selection when attempting to Ctrl-C + Ctrl-V

### Update 2020-02-14
* Fixed bug when using underscore in source code file name
* Better error details when 'end' is missing after function, object, while, for, if etc.
* More informative error message when attempting to use a reserved keyword as a variable name
* fixed mouseup closing some dialog windows when not intented
* added CrazyGames to the list of suggested game publication platforms

### Update 2020-01-30
* new drawing functions: drawLine, drawPolygon, fillPolygon, drawRect, drawRound, drawRoundRect, setLineWidth
* 9 tutorials now available in English
* added ```system.language``` (gives the 2-letter code for the user preferred language)

### Update 2020-01-15
* added visual screen coordinate helpers when typing code for drawing on screen.
* improved number and color value tools, allowing to change values live in code with slider / color picker

### Update 2020-01-06
* microScript now accepts string literals with simple quotes
* Some fixes in the documentation
* Created 9 tutoriels in French - soon to be translated to English

### Update 2019-11-29
* Interactive tutorial system! (Based on this system, tutorials will be introduced progressively)

### Update 2019-11-12
* Fixed a few issues with syntax highlighting in the code editor

### Update 2019-11-06
* Guest mode: visitors can now use microStudio without registering an account
* Improved console now supports multi-line input (when creating a function, loop or object requiring multiple lines)

### Update 2019-10-30
* New console window. Previoulsy was using jquery terminal and caused performance issues. The new console is simpler but without issues :-)
* New home page, more informative and presumably more catchy

### Update 2019-10-23
* ```system.inputs``` provides information on the availability of a keyboard, a mouse, touch screen or gamepads on the host system
* implemented ```mouse``` object (specifically useful to track mouse position when no button is pressed and different mouse buttons separately)
* Fixed wrong call context when global function was called from an object member function

### Update 2019-10-22
* microScript update:
  * object member functions now operate primarily in the object scope ; assigning a value to a variable creates a field in the object ; global scope can still be addressed in object member functions by using the ```global``` object such as in ```global.x = 10``` ; this is to be consistent with the upcoming classes and instanciated objects.
```
a = object
  value = 5
  set = function(v)
    value = v
  end
end
```
(calling ```a.set(5)``` will assign 5 to ```a.value```, rather than global variable ```value```)
  * nested scoping, inspired from JavaScript closures, has been removed. Wasn't documented, neither used I believe. If anything breaks in your code due to this, do not hesitate in contacting me. This should allow better performance when microScript will be transpiled to other languages (starting with JavaScript).
* I hope you like the new microStudio icon :-)

### Update 2019-09-30
* New publishing option: full HTML5 export!
* export sprites of public projects as ZIP file
* fixed bug with the positioning of the app window in landscape mode
* tagging projects "sprite pack" or "tutorial" makes sprite list or project doc open automatically

### Update 2019-09-23
* Introduced ```screen.drawSpritePart``` (draw a sub-rectangle of a sprite)

### Update 2019-09-17
* Limited number of lines displayed in console to avoid performance problems (console window may be changed sometime to better deal with this problem)

### Update 2019-09-03
* Fonts! You now have access to 46 different bitmap-style fonts for drawing text.
* Import images to your project by drag & drop to the sprite list (size limit: 256x256 pixels)
* Concatenating JS and CSS files to improve performance

### Update 2019-07-30
* You can now post and read comments on public projects
* Added a language switch to change from English to French ; please contact me if you want to help translating microStudio in your native language!

### Update 2019-07-15
* Fixed performance issue when using map.set() intensively

### Update 2019-07-10
* Deactivated AudioWorklet, because it may ultimately be responsible for Chrome crashes. As a result, there is an increased delay of the audio playback of the engine. The AudioWorklet will be restored as soon as possible.
* Restored the PWA functionality, as it is probably not the cause for Chrome crashes. Games installed on devices now also work offline!

### Update 2019-07-04
* microScript syntax now accepts float values written with leading dot, such as .5 .0675 etc.
* fixed error messages in console log, which was referring to file "undefined"

### Update 2019-07-03
* changed the public project sorting algorithm to take both youth and popularity (likes) into account
* augmented documentation with access to sprites and maps methods/fields, as well as string and list methods/fields

### Update 2019-07-02
* added missing core functions: acos, asin, atan, atan2, log, exp
* fixed incorrect orientation locking in fullscreen when in landscape mode

### Update 2019-07-01
* Public project presentation page now has its own URL /i/owner/project/
* Restored some PWA functionality

### Update 2019-06-27
* Disabled PWA service worker caching ; trying to understand if it could cause the crashes reported on Chrome
* AudioWorklet is now started only when audio.beep() is first called
* Added changelog
* Fixed potential bug with displaying TOS when registering
* Reworked Terms of Service and About section
