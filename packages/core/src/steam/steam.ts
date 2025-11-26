import SteamUser from "steam-user";

export class Steam extends SteamUser {
  // call me master hacker the way i be cheesing this up
  async logOn(...parameters: Parameters<SteamUser["logOn"]>) {
    let loggedOn = false;
    const self = this;

    this.on("loggedOn", () => {
      console.log(`Logged onto ${self.steamID!.steam3()}`);
      loggedOn = true;
    });

    while (!loggedOn) {
      // @ts-ignore
      this._connectionClosed = false;

      console.log("Attempting to log on...");
      super.logOn(...parameters);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
