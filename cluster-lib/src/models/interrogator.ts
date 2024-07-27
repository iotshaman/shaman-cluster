import * as readline from 'readline';

export class Interrogator {

	async ask (prompt: Prompt): Promise<string> {
		let response = await this.question(prompt);
		return response.value;
	}

	async interrogate (prompts: Prompt[]): Promise<{[key: string]: string}> {
		var state: {[key: string]: string} = {};
		for (var i = 0; i < prompts.length; i++) {
			var response = await this.question(prompts[i]);
			state[response.key] = response.value;
		}
		return state;
	}

	private question(prompt: Prompt, stdin?: readline.Interface): Promise<{key: string, value: string}> {
		if (!stdin) stdin = readline.createInterface(process.stdin, process.stdout);
		return new Promise(res => {
			stdin.question(prompt.prompt, answer => {
				answer = answer.trim();
				if (!!prompt.validator && !prompt.validator(answer)) {
					console.warn('Invalid response.\r\n');
					return res(this.question(prompt, stdin));
				}
				stdin.close();
				return res({key: prompt.key, value: answer});
			});
		})
	}

}

export type Prompt = {
	prompt: string;
	key: string;
	validator?: (answer: string) => boolean;
}
