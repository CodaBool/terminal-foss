async function openForAll() {
    /*
      This macro opens a Terminal for all users regardless of their position in the scene
      An argument of the tile UUID for the specific Terminal you wish to use is required
  
      I recommend using the Monk's Active Tiles module to add clickable tiles which can
      run marcros with arguments. Alternatively you can use Foundry's built-in Regions
    */
  
    // validate existance of arguments
    if (typeof args === 'undefined') {
      ui.notifications.error("provide a Tile UUID as an argument run this macro")
      return
    }
  
    // validate length of arguments
    if (args.length !== 1) {
      ui.notifications.error(`you must provide a single argument, the Tile UUID. You gave '${args}'`)
      return
    }
  
    // validate the tile's Terminal settings
    const t = await fromUuid(args[0])
    const valid = await window.validateTerminalTile(t, true)
  
    // if the validation is getting in your way feel free to comment the next line out
    if (!valid) return
  
    const users = game.users?.filter(u => u.active && !u.isGM)
  
    // prompt for skill check roll if skilled
    if (t.getFlag("terminal", "skilled")) {
      for (const user of users) {
        foundry.applications.api.DialogV2.wait({
          window: { title: "Terminal Access" },
          content: `<p style="font-size:1.4em; max-width: 400px"><strong>${user.name}</strong> is attempting to open a skill required Terminal. Have them perform your <strong>skill check</strong> of choice. Then chose the appropriate action.</p>`,
          buttons: [{
            action: "1",
            label: `Allow ${user.name}`,
            icon: "fas fa-check",
            callback: () => {
              game.socket.emit('module.terminal', {
                uid: user.id, tuid: args[0], action: "render"
              })
            }
          },
          {
            action: "2",
            label: `Deny ${user.name}`,
            icon: "fa-solid fa-ban",
          }],
        })
      }
    } else {
  
      // open terminal for each user
      ui.notifications.info(`Terminal | opened for ${users.length} user${users.length > 1 ? "s" : ""} (${users.map(u => u.name)})`)
      for (const user of users) {
        game.socket.emit('module.terminal', { action: "render", tuid: args[0], uid: user.id })
      }
    }
  }
  
  async function openForOne() {
    /*
      This macro opens a Terminal for a specific user regardless of their position
      in the scene. Arguments of the tile UUID for the specific Terminal you wish
      to use and optionally the user UUID
  
      If only the Tile UUID is given as an argument, and no user UUID
      this macro will assume you are running this with Monk's Active Tiles
      and that you have specified it to run "as triggering player".
  
      If you supply both the Tile ID and a user ID as arguments then it will
      assume its running as GM
  
      I recommend using the Monk's Active Tiles module to add clickable tiles which can
      run marcros with arguments. Alternatively you can use Foundry's built-in Regions
    */
  
  
    // validate existance of arguments
    if (typeof args === 'undefined') {
      ui.notifications.error("provide a Tile UUID as an argument run this macro")
      return
    }
  
    // validate length of arguments
    if (args.length !== 2 && args.length !== 1) {
      ui.notifications.error(`you must provide a one or two arguments, the Tile UUID and optionally the User UUID. You gave '${args}'`)
      return
    }
  
    // validate the tile's Terminal settings
    const t = await fromUuid(args[0])
    // TODO: should not await this and start using fromUuidSync
    const valid = await window.validateTerminalTile(t, true)
  
    // if the validation is getting in your way feel free to comment the next line out
    if (!valid) return
  
    // get user
    let user
    if (args.length !== 2) {
      user = game.user
    } else {
      user = await fromUuid(args[1])
    }
  
    // validate that the specific user exists
    if (!user) {
      ui.notifications.error(`Terminal | The user '${args[1]}' does not exist. Make sure to use UUID`)
      return
    }
  
    // validate that the specific user is connected
    const userExists = game.users.some(u => u.id === user.id)
    if (!userExists) {
      ui.notifications.error(`Terminal | The user '${user.name}' is not active`)
      return
    }
  
    // if there are 2 args then open for specified user
    const skilled = t.getFlag("terminal", "skilled")
    if (args.length === 2) {
      if (skilled) {
        foundry.applications.api.DialogV2.wait({
          window: { title: "Terminal Access" },
          content: `<p style="font-size:1.4em; max-width: 400px"><strong>${user.name}</strong> is attempting to open a skill required Terminal. Have them perform your <strong>skill check</strong> of choice. Then chose the appropriate action.</p>`,
          buttons: [{
            action: "1",
            label: `Allow ${user.name}`,
            icon: "fas fa-check",
            callback: () => {
              game.socket.emit('module.terminal', {
                uid: user.id, tuid: args[0], action: "render"
              })
            }
          },
          {
            action: "2",
            label: `Deny ${user.name}`,
            icon: "fa-solid fa-ban",
          }],
        })
      } else {
        ui.notifications.info(`Terminal | opened for ${user.name}`)
        game.socket.emit('module.terminal', { action: "render", tuid: args[0], uid: user.id })
      }
    } else {
      // this block could be reached by either a GM or a user
      if (!game.user.isGM) {
        // find a connected GM
        const gms = game.users?.filter(u => u.active && u.isGM)
        if (!gms.length) {
          ui.notifications.error("Terminal | No GM is connected, this module cannot work without one.")
          return
        }
        if (skilled && !game.user.isGM) {
          new Skilled("but getting access will not be easy...").render(true)
          game.socket.emit("module.terminal", {
            action: "gmApprove",
            uid: game.user.id,
            tuid: args[0],
            gid: gms[0]._id,
            name: game.user.name,
            title: "opening a skilled Terminal",
          })
          return
        }
        game.socket.emit('module.terminal', { action: "notify", message: `${user.name} opened a terminal` })
      } else {
        ui.notifications.info("opening as GM, give user UUID as a 2nd arg if you want a specific user to open a Terminal")
      }
      // don't open if a Terminal is already open
      if (!document.querySelector(`.${args[0].replace(/\./g, '-')}`)) {
        new Terminal(args[0]).render(true)
      }
    }
  }
  