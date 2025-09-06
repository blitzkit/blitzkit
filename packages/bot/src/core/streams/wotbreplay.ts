import { ReadStream } from "@blitzkit/core";
import AdmZip from "adm-zip";
import { readFile } from "fs/promises";
import { Parser } from "pickleparser";
import protobuf from "protobufjs";

interface WotbReplayMetaJson {
  version: string;
  title: string;
  dbid: string;
  playerName: string;
  battleStartTime: string;
  playerVehicleName: string;
  mapName: string;
  arenaUniqueId: string;
  battleDuration: number;
  vehicleCompDescriptor: number;
  camouflageId: number;
  mapId: number;
  arenaBonusType: number;
}

export class WotbReplayReadStream extends ReadStream {
  async wotbReplay() {
    const pickleParser = new Parser();
    const zip = new AdmZip(Buffer.from(this.buffer));
    const metaJsonBuffer = zip.getEntry("meta.json")?.getData();
    const battleResultsDat = zip.getEntry("battle_results.dat")?.getData();

    if (!metaJsonBuffer || !battleResultsDat)
      throw new SyntaxError("meta.json not found");

    const metaJson = JSON.parse(
      metaJsonBuffer.toString()
    ) as WotbReplayMetaJson;
    const unpickledBattleResults = pickleParser.parse(battleResultsDat);
    const [, battleResultsString] = unpickledBattleResults as [number, string];
    const root = await protobuf.load(
      `${__dirname}/../../protos/BattleResultsClient.proto`
    );
    const BattleResults = root.lookupType(
      "BattleResultsGenerated.BattleResultsClient"
    );

    const reader = protobuf.Reader.create(Buffer.from(battleResultsString));

    // const decodedBattleResults = BattleResults.decodeDelimited(
    //   Buffer.from(battleResultsString),
    // );
    // console.log(decodedBattleResults.toJSON());
  }
}

const replay = await readFile("temp/test3.wotbreplay");
const stream = new WotbReplayReadStream(replay.buffer as ArrayBuffer);

stream.wotbReplay();
