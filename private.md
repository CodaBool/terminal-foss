# Dev Notes
## Recently thought up improvements
- noise on weird screensize is bad
- look into DialogV2.input for dialog text input, find out how DialogV2.query works
- should probably steal the html that Foundry uses for tooltips (can pulled from wall palette)

## what I mentioned as upcoming
- revisit permission reset / local Terminal only mode
- give way to control if observe token is just for individual or everyone
- validation on Global Illumination, it conflicts with some features (i.e. starfinder has this on by default)
- main character mode (one person uses Terminal and all others watch their actions)
- integrate with Net Elevators
- ability for GM to activate a Lockdown, this stops users from using a Terminal and displays a timer
- use a border image by default for newly created styles
- you can just find app and render() instead of Math.random()
- different layouts
- cleanup teleport code
- add borderImage stretch option instead of hardcode round

## Bugs
- !using `power` in cli/gui did not display ascii!
- walking off too fast keeps Terminal open
- rewalking can catch previous timeouts
- Observe Tokens has bugs
- obersve scene pans to top left corner
- MINOR: drag select on input does not trigger Dialog in Hooks
- SHADOW: CLI mode should have the input disabled [might be a stale bug]
- SHADOW: CLI mode ssh does not shadow, meaning a new window is not opened [might be a stale bug]
## startup video is 2.55s

### Permission resets to Default
> you can set anyone to default with this

```js
let permission = game.journal.get("LV5m2T5XWE312nnm").ownership
for (let u of game.users) {
  if (!u.isGM) delete permission[u.id]
}
game.journal.get("LV5m2T5XWE312nnm").update({ permission })
```

## Links
- [reference](https://brennan.io/2017/06/14/alien-computer-card/)
- [icons](https://fontawesome.com/search?o=r&c=gaming)
- [trim video](https://online-video-cutter.com)
- [create boomerang](https://clideo.com/how-to-make-boomerang-video)

# Art
- https://codepen.io/obsfx/pen/jOWVOYL box with listener
- https://codepen.io/tholman/pen/BQLQyo typing
- https://codepen.io/umarcbs/pen/mdEJezx typing
- sw video = Isaac Taracks + http://www.taracks.com
- shader https://www.shadcnblocks.com/block/shader8
- shader https://www.shadcnblocks.com/block/shader6

# pull latest manifest
wrangler d1 execute foundry --command="SELECT * FROM manifests"


# process
- trim video = https://online-video-cutter.com/
- make boomerang = https://clideo.com/how-to-make-boomerang-video
- remove watermark = https://online-video-cutter.com/remove-logo
- compress = https://www.freeconvert.com/video-compressor

# Popularity
1. Starfinder (module) 50%
2. RED (PDF) 43%
3. FFG (PDF) 40%
4. Lancer (PDF) 39%
5. Alien (module) 32%
6. Shadowrun (module) 20%
7. Warhammer: WG (module) 18% [2018]
8. Stars Without Number (PDF) 14%
9. Traveller (PDF) 13%
10. Fallout (PDF) 11%
11. startrek 2d20 (PDF) 10%
12. Blade Runner (module) 10%
13. Mothership (PDF) 9%
14. Warhammer: IM (module) 7% [2023]

2024 year in review has the usage percentages
https://foundryvtt.com/article/year-in-review-2024

# Rules
- star wars = local machine
- dblade runner = module BOUGHT |
- cyberpunk = local machine | file:///home/codabool/Downloads/pdfcoffee.com_cpr-corebook-cyberpunk-red-v121pdf-pdf-free.pdf
- fallout = http://nomansland.site.nfoservers.com/Resource/Fallout/Fallout%20d20%20Rules.pdf
- lancer = local machine
- Warhammer 40,000: Imperium Maledictum = module BOUGHT |
- Warhammer 40,000: Wrath & Glory = module BOUGHT |
- starfinder = module BOUGHT | http://orc-news.ru/PDF/starfinder/Starfinder%20-%20Core%20Rulebook.pdf
- shadowrun = https://www.shadowruntabletop.com/game-resources | http://shadowruntabletop.com/wp-content/uploads/2013/02/E-CAT27QSR_SR5-Quick-Start-Rules.pdf

# Ideas
- Cyberpunk Red. oh boy, it's its own thing. THE NET ELEVATORS are very distinct
- look into the tile class config, which seems to change. I have a workaround but, would be best to understand it
- [DASH TOGGLE] Lockdown, will have a timer (will last for typically 10 minutes but can be for 1hr or 1 day)
- main character mode
- [DASH TOGGLE] fake shell, garabage data until a new roll is done
- [DASH TOGGLE] wipe (rules say this is when 3 or so failed logins)

# Local Testing
1. run the script below, with the secret value
```sh
cp module.json module.backup.json
jq 'del(.protected) | .manifest = "https://d3erver.codabool.workers.dev/manifest?secret=REDACT&module=terminal&beta=true"' module.json  > temp_file && mv temp_file module.json
zip -r terminal.zip .
bunx wrangler r2 object put module/terminal-v0.0.0 -f terminal.zip --ct application/zip --cc public
mv module.backup.json module.json
rm terminal.zip
```
2. install using manifest URL `https://d3erver.codabool.workers.dev/manifest?secret=REDACT&module=terminal&beta=true`


## method to jq a D1 result
```
echo -e $(wrangler d1 execute foundry --remote --command="SELECT data FROM manifests WHERE module = 'codabool-terminal-test'"  | grep -oP '{.*}') | sed 's/\\//g' | jq -r .version
```

## Forge Preview
> forge cron request is set to 8-10 minutes https://forge-vtt.com/bazaar/package/codabool-terminal-test
```sh
version=$(echo -e $(bunx wrangler d1 execute foundry --remote --command="SELECT data FROM manifests WHERE module = 'codabool-terminal-test'"  | grep -oP '{.*}') | sed 's/\\//g' | jq -r .version)
echo -e "Current version: $version\n"
echo -n "Enter new version: "
read new_version
echo "creating new version for $new_version"
cp module.json module.backup.json
jq --arg version "$new_version" 'del(.protected) | .manifest = "https://d3erver.codabool.workers.dev/manifest?secret=REDACT&module=terminal&beta=true&forge=true" | .id = "codabool-terminal-test"| .title = "codabool-terminal-test" | .version = $version' module.json  > temp_file && mv temp_file module.json
zip -r terminal.zip .
bunx wrangler d1 execute foundry --remote --command="UPDATE manifests SET data = '$(cat module.json)' WHERE module = 'codabool-terminal-test'"
bunx wrangler r2 object put module/terminal-v0.0.0 -f terminal.zip --ct application/zip --cc public
mv module.backup.json module.json
rm terminal.zip
```

# Production Release
1. push to main
2. git tag -a v3.5.0 -m ""
3. git push -u origin v3.5.0
4. watch [actions](https://github.com/CodaBool/terminal-foss/actions)
5. verify that version is updated in `bunx wrangler d1 execute foundry --remote --command="SELECT data FROM manifests WHERE module = 'terminal'" --json | jq -r '.[].results[].data' | jq .version`
6. verify R2 upload at [cloudflare](https://dash.cloudflare.com). Start a webhook for log listening.
7. verify installation with a foundry docker locally
8. https://foundryvtt.com/packages/terminal/edit

# Hotfix for previous Foundry version
1. git switch -c 3.x [COMMIT_HERE]
2. git push -u origin 3.x
3. git tag -a v3.2.7 -m "v3.2.7 hotfix"
4. git push origin v3.2.7
5. create a manual public release [here](https://github.com/CodaBool/terminal-foss/releases). Select to create a new branch and upload your module.json (title is in this format "vX.X.X")




# CLEAN ME UP

## Think about these
- revisit permission reset / local Terminal only mode
- give way to control if observe token is just for individual or everyone
- main character mode (one person uses Terminal and all others watch their actions)
- research an integration with Lancer
- different layouts
- type mode
  - hotkeys [1] Basics [2] Advanced
- DnD style (paper book + wizard shit)
- ability for GM to run a lockdown macro, this stops users from using a Terminal and displays a timer
- need to make skull_3 more transparent

## TODO:
- test out a DnD style (paper)

## Creative styles
- big red ERROR block https://www.youtube.com/watch?v=rAJTvqhODF0
  - PASSWORD OR SKILL CHECK IS A GOOD SPOT FOR THIS
- print lines using ascii and adding lines https://chrisbuilds.github.io/terminaltexteffects/showroom/#print
- slide using green sock https://chrisbuilds.github.io/terminaltexteffects/showroom/#slide
- cool looking ascii borders neon effect https://docs.theme-park.dev/themes/addons/unraid/login-page/retro-terminal/
- there are a lot of content on wallpaper engine https://steamcommunity.com/workshop/browse/?appid=431960&searchtext=cyberpunk+2077+Samurai&browsesort=trend&section=readytouseitems&actualsort=trend&p=2&days=7
- look into transparent terminals
- style https://www.pinterest.com/pin/4925880838113674/
- ditherboy for more animations 
- show memory usage , cpu usage, temp, disk, network, volume, min, close, time/date, directory, 
- cli help should look more like this https://media.geeksforgeeks.org/wp-content/uploads/20210710140938/11.png
## Actually fun ideas

- Cyberpunk
  - KEYSTONE (this is a browser by netwatch)
  - Arasaka (1st)
  - Militech (2nd)
  - Netwatch (police the internet)


## From obsidian
- scrap for ideas https://github.com/ShazProd/alien-mu-th-ur/tree/main
	- typing
	- alien new line effect
	- commands (could expose access to existing buttons)

## Shadow Feature
#### Cover these features
require a item for access (keycard)
detect motion within the scene (pings all tokens)
observe token, camera pan
secure shell
clear fog of war for the scene (download a map)
password
lock & unlock doors
run a macro with arguments
switch lights on or off
Monk's Active Tiles: run triggers
ALIEN RPG exclusive: charge items
simulate native Foundry Region events for unlimited possibilities
encrypt journal pages, requiring a skill check to view
require skill checks any/all above features

#### TODO
- use the manual
- force manual that all users (shadow & source) are viewing the same scene
- use the automatic
- add a limitations section
	- cannot shadow the skilled/item required window
	- does not pan for observe token or detect motion
	- can only shadow someone on same scene
	- cannot shadow a Terminal with a password
- create macro which does what the manual does


# goal (potential features to implement in August)
- rework skill check screen
- get more coverage on shadow feature
- steal ideas from other module
	- typing effect to player
	  - https://codepen.io/umarcbs/pen/mdEJezx typing
		- gsap
		- whatever that guy had https://github.com/ShazProd/alien-mu-th-ur/tree/main
	- alien new line effect
	- commands (could expose access to existing buttons)

# scratch from Obsidian
- read the "The Hacker's Handbook" MoSh module or blog https://goblinzone.bearblog.dev/making-hacking-an-osr-style-problem/
- [typing sounds](https://www.patreon.com/posts/138855458)
