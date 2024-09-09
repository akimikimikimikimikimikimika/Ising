// eslint-disable-next-line @typescript-eslint/no-namespace
export declare function registerPaint(name: string, classDef: typeof DrawScene): void;

export type Context = CanvasRenderingContext2D;
export type Size = { width: number, height: number };
export type Properties = { get: (prop: string) => string; };


class DrawScene {

	static get inputProperties(): string[] {
		return [
			"--binary-data", "--side",
			"--on-color", "--off-color"
		];
	}

	paint(
		context: Context,
		size: Size,
		properties: Properties
	) {

		// get values of CSS properties
		const [bitsStr, sideStr, onColor, offColor] =
			DrawScene.inputProperties
			.map( prop => properties.get(prop).toString() );

		context.clearRect(0, 0, size.width, size.height);

		const side = parseInt(sideStr);
		if (isNaN(side)) return;

		const match = bitsStr.match(/[01]+/);
		if (match==null) return;
		const bits = match[0].split("").map(char => char === "1");

		// get positions
		const positions =
			Array.from({ length: side + 1 })
			.map((_,idx) => ({
				x: Math.round( idx * size.width  / side ),
				y: Math.round( idx * size.height / side )
			}));

		// draw all cells
		for (let x=0;x<side;x++) for (let y=0;y<side;y++) {
			const value = bits[ x + y*side ];
			context.beginPath();
			context.rect(
				positions[x].x, positions[y].y,
				positions[x+1].x - positions[x].x,
				positions[y+1].y - positions[y].y
			);
			context.fillStyle = value ? onColor : offColor;
			context.fill();
		}

	}

}


registerPaint("scene", DrawScene);