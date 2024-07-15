export class CommandLineArguments {
  private args: { [key: string]: string } = {};
  private argRegex: RegExp = /-{2}[a-zA-Z]+=.+/;

  constructor(argv: string[]) {
    let args = argv.slice(2);
    for (let arg of args) {
      if (!this.argRegex.test(arg)) continue;
      let splitArg: string[] = arg.split('=');
      let key: string = splitArg[0].slice(2);
      let value: string = splitArg[1];
      this.args[key] = value;
    }
  }

  public getValueOrDefault = <T>(key: string, defaultValue?: T): string | T => {
    if (!!this.args[key]) return this.args[key];
    return defaultValue || null;
  }

}
