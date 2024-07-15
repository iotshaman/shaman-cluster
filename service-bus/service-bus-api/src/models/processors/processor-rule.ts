export class ProcessorRule {

  prop: string;
  value: string;
  operator: string;

  static matches(rules: ProcessorRule[], args: any): boolean {
    args = args || {};
    if (!rules?.length) return true;
    return rules.every(r => {
      switch (r.operator) {
        case '=': return args[r.prop] === r.value;
        case '!=': return args[r.prop] !== r.value;
        case '%': return String(args[r.prop]).includes(r.value);
      }
    });
  }

}