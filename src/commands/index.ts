import { PlayCommand } from "./play.command";
import { StopCommand } from "./stop.command";
import { QueueCommand } from "./queue.command";
import { SkipCommand } from "./skip.command";
import { PauseCommand } from "./pause.commands";
import { ResumeCommand } from "./resume.command";
import { JoinCommand } from "./join.command";
import { DisconnectCommand } from "./disconnect.command";
import { NowPlayingCommand } from "./nowplaying.command";
import { ClearCommand } from "./clear.command";
import { ShuffleCommand } from "./shuffle.command";
import { UnshuffleCommand } from "./unshuffle.command";
import { MoveCommand } from "./move.command";
import { JumpCommand } from "./jump.command";

export const Commands = {
    PlayCommand,
    StopCommand,
    QueueCommand,
    SkipCommand,
    PauseCommand,
    ResumeCommand,
    JoinCommand,
    DisconnectCommand,
    NowPlayingCommand,
    ClearCommand,
    ShuffleCommand,
    UnshuffleCommand,
    MoveCommand,
    JumpCommand
}