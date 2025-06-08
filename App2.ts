
type ColorsUnion = 'red' | 'green' | 'blue' | 'yellow'; // может быть расширяемым
type ColorData = { // тоже может быть любым
  main: string;
  dark: string;
  light: string;
  extra: string;
};

type InputModel = Record<ColorsUnion, ColorData>
type TInputModel< U extends ColorsUnion, T extends ColorData> = Record<U,T>

type ColorDataModifier<T extends ColorData> = (colorData: T) => Record<string, string>;

type Subtone<T extends ColorData> = {
    name: string;
    subtone: {
        [subtoneName:string]:ColorDataModifier<T>
    }
} 

type BaseCallback<T extends ColorData> = (ColorDataModifier<T>)

type ToneCallback<T extends ColorData> = BaseCallback<T> & { subtone: Subtone<T> }

type ColorConfig<T extends ColorData> = {
  base: BaseCallback<T>;
  tones: {
    [toneName: string]: ToneCallback<T>;
  };
};



type PaletteShape<T extends ColorData, U extends ColorsUnion> = 
{ // colordata + base tone
    [COLOR in keyof TInputModel<U,T> ]:ReturnType<ColorConfig<T>['base']> & T
} & 
{ //tones 
    [COLOR in keyof TInputModel<U,T>  as
        (
            {
                [TONE in keyof ColorConfig<T>['tones']]:`${Extract<COLOR, string>}_${Extract<ColorConfig<T>['tones'][TONE]['subtone']['name'], string>}` 
            }[keyof ColorConfig<T>['tones']]
            
        )
    ]:
    ReturnType<ColorConfig<T>['tones'][keyof ColorConfig<T>['tones']]>
     
}& {//subtones
    [COLOR in keyof TInputModel<U,T> as
      (
        {
          [TONE in keyof ColorConfig<T>['tones']]:  
              (
                { [S in keyof ColorConfig<T>['tones'][TONE]['subtone']['subtone']]: `${Extract<COLOR, string>}_${Extract<S, string>}_${Extract<ColorConfig<T>['tones'][TONE]['subtone']['name'], string>}` }[keyof ColorConfig<T>['tones'][TONE]['subtone']['subtone']]
              )
        }[keyof ColorConfig<T>['tones']]
      )
    ]:
      {
        [TONE in keyof ColorConfig<T>['tones']]:{
              [S in keyof ColorConfig<T>['tones'][TONE]['subtone']['subtone']]:
                ReturnType<
                  ColorConfig<T>['tones'][TONE]['subtone']['subtone'][S]
                >
            }[keyof ColorConfig<T>['tones'][TONE]['subtone']['subtone']]

      }[keyof ColorConfig<T>['tones']]
}


export function createTone<T extends ColorData> (dataModifier:ColorDataModifier<T>, subtoneSettings?:Subtone<T>) : ToneCallback<T> | BaseCallback<T>{
    
    if(subtoneSettings){
        const callback =  ((data) => dataModifier(data as T)) as ToneCallback<T>;
        callback.subtone = subtoneSettings;
        return callback as ToneCallback<T>;
    }
    const callback =  ((data) => dataModifier(data as T)) as BaseCallback<T>;
    return callback as BaseCallback<T>;
}

export function createPalette<T extends ColorData, U extends ColorsUnion>(inputModel : TInputModel<U, T>,  config : ColorConfig<T>) : PaletteShape<T, U>{
    const result = {} as PaletteShape<T, U>;

    for (const color in inputModel){
        result[color]={...inputModel[color],...config.base(input[color] as T)} 

        for(const toneKey in config.tones){
            const toneCallback = config.tones[toneKey];
            const subtoneName = toneCallback.subtone.name;
            result[`${color}_${subtoneName}`] = toneCallback(input[color] as T); 
            
            for (const sub in toneCallback.subtone.subtone) {
                const subCallback = toneCallback.subtone.subtone[sub];
                result[`${color}_${sub}_${subtoneName}`] = subCallback(input[color] as T);
            }

        }
    }

    return result
}



const input = {
  red: {
    main: 'red',
    dark: 'darkred',
    light: 'lightred',
    extra: 'extrared',
  },
  green: {
    main: 'green',
    dark: 'darkgreen',
    light: 'lightgreen',
    extra: 'extragreen',
  },
  blue: {
    main: 'blue',
    dark: 'darkblue',
    light: 'lightblue',
    extra: 'extrablue',
  },
  yellow: {
    main: 'yellow',
    dark: 'darkyellow',
    light: 'lightyellow',
    extra: 'extrayellow',
  },
} satisfies InputModel;

const output = {
  "red": {
    "main": "red",
    "dark": "darkred",
    "light": "lightred",
    "extra": "extrared",
    "background": "red",
    "color": "red"
  },
  "green": {
    "main": "green",
    "dark": "darkgreen",
    "light": "lightgreen",
    "extra": "extragreen",
    "background": "green",
    "color": "green"
  },
  "blue": {
    "main": "blue",
    "dark": "darkblue",
    "light": "lightblue",
    "extra": "extrablue",
    "background": "blue",
    "color": "blue"
  },
  "yellow": {
    "main": "yellow",
    "dark": "darkyellow",
    "light": "lightyellow",
    "extra": "extrayellow",
    "background": "yellow",
    "color": "yellow"
  },
  "red_brightness": { "foreground": "red", "customProp": "#f0f0f0" },
  "red_low_brightness": { "white": "lightred" },
  "red_medium_brightness": { "shadow": "red" },
  "red_high_brightness": {
    "someProp": "transparent",
    "anotherProp": "#fff",
    "thirdCustomProp": "red"
  },
  "red_ultra_brightness": { "intensive": "extrared" },
  "green_brightness": { "foreground": "green", "customProp": "#f0f0f0" },
  "green_low_brightness": { "white": "lightgreen" },
  "green_medium_brightness": { "shadow": "green" },
  "green_high_brightness": {
    "someProp": "transparent",
    "anotherProp": "#fff",
    "thirdCustomProp": "green"
  },
  "green_ultra_brightness": { "intensive": "extragreen" },
  "blue_brightness": { "foreground": "blue", "customProp": "#f0f0f0" },
  "blue_low_brightness": { "white": "lightblue" },
  "blue_medium_brightness": { "shadow": "blue" },
  "blue_high_brightness": {
    "someProp": "transparent",
    "anotherProp": "#fff",
    "thirdCustomProp": "blue"
  },
  "blue_ultra_brightness": { "intensive": "extrablue" },
  "yellow_brightness": { "foreground": "yellow", "customProp": "#f0f0f0" },
  "yellow_low_brightness": { "white": "lightyellow" },
  "yellow_medium_brightness": { "shadow": "yellow" },
  "yellow_high_brightness": {
    "someProp": "transparent",
    "anotherProp": "#fff",
    "thirdCustomProp": "yellow"
  },
  "yellow_ultra_brightness": { "intensive": "extrayellow" },
  "red_depth": { "background": "lightred", "foreground": "red", "color": "extrared" },
  "red_8-bit_depth": { "borderColor": "red" },
  "red_16-bit_depth": { "borderColor": "red", "anotherColor": "lightred" },
  "red_24-bit_depth": { "extraColor": "extrared" },
  "green_depth": {
    "background": "lightgreen",
    "foreground": "green",
    "color": "extragreen"
  },
  "green_8-bit_depth": { "borderColor": "green" },
  "green_16-bit_depth": { "borderColor": "green", "anotherColor": "lightgreen" },
  "green_24-bit_depth": { "extraColor": "extragreen" },
  "blue_depth": { "background": "lightblue", "foreground": "blue", "color": "extrablue" },
  "blue_8-bit_depth": { "borderColor": "blue" },
  "blue_16-bit_depth": { "borderColor": "blue", "anotherColor": "lightblue" },
  "blue_24-bit_depth": { "extraColor": "extrablue" },
  "yellow_depth": {
    "background": "lightyellow",
    "foreground": "yellow",
    "color": "extrayellow"
  },
  "yellow_8-bit_depth": { "borderColor": "yellow" },
  "yellow_16-bit_depth": { "borderColor": "yellow", "anotherColor": "lightyellow" },
  "yellow_24-bit_depth": { "extraColor": "extrayellow" }
}

// TESTS
const baseColors = createTone((data) => ({
  background: data.main,
  color: data.main,
})) as BaseCallback<ColorData>;

const brightness = createTone((data) => ({
  foreground: data.main,
  customProp: '#f0f0f0'
}), {
  name: 'brightness',
  subtone: {
    low: (data) => ({ white: data.light }),
    medium: (data) => ({ shadow: data.main }),
    high: (data) => ({
      someProp: 'transparent',
      anotherProp: '#fff',
      thirdCustomProp: data.main,
    }),
    ultra: (data) => ({ intensive: data.extra }),
  },
}) as ToneCallback<ColorData>;

const depths = createTone((data) => ({
  background: data.light,
  foreground: data.main,
  color: data.extra,
}), {
  name: 'depth',
  subtone: {
    '8-bit': (data) => ({
      borderColor: data.main,
    }),
    '16-bit': (data) => ({
      borderColor: data.main,
      anotherColor: data.light,
    }),
    '24-bit': (data) => ({
      extraColor: data.extra,
    }),
  },
}) as ToneCallback<ColorData>;

console.log("TESTING CREATE TONE")

//TESTING THE COLOR DATA
const myData: ColorData = {
  main: "#777",
  light: "#fff",
  dark: "#000",
  extra: "#111",
};

const myDataObj = {
  main: "#777",
  light: "#fff",
  dark: "#000",
  extra: "#111",
};

expectEqualObj(
  baseColors(myData),
  { background: "#777", color: "#777" },
  "baseColors"
);

nameCheck(brightness, "brightness");

expectEqualObj(
  brightness(myDataObj),
  { foreground: "#777", customProp: "#f0f0f0" },
  "brightness (main)"
);

expectEqualObj(
  brightness.subtone?.subtone.low(myDataObj),
  { white: "#fff" },
  "brightness low subtone"
);

expectEqualObj(
  brightness.subtone?.subtone.medium(myDataObj),
  { shadow: "#777" },
  "brightness medium subtone"
);

expectEqualObj(
  brightness.subtone?.subtone.high(myDataObj),
  {
    someProp: 'transparent',
    anotherProp: '#fff',
    thirdCustomProp: '#777',
  },
  "brightness high subtone"
);

expectEqualObj(
  brightness.subtone?.subtone.ultra(myData),
  { intensive: "#111" },
  "brightness ultra subtone"
);
nameCheck(depths, "depth");
expectEqualObj(
  depths(myData),
  { background: "#fff", foreground: "#777", color: "#111" },
  "depths (main)"
);

expectEqualObj(
  depths.subtone?.subtone["8-bit"](myData),
  { borderColor: "#777" },
  "depths 8-bit subtone"
);

expectEqualObj(
  depths.subtone?.subtone["16-bit"](myData),
  { borderColor: "#777", anotherColor: "#fff" },
  "depths 16-bit subtone"
);

expectEqualObj(
  depths.subtone?.subtone["24-bit"](myData),
  { extraColor: "#111" },
  "depths 24-bit subtone"
);
const testPalette = createPalette(input, {base:baseColors, tones:{brightness:brightness, depths:depths}}) as PaletteShape<ColorData, ColorsUnion>;
console.log(testPalette)
if (deepEqualRecordsOfRecords(testPalette, output)) {
  console.log("The palettes are equal!");
} else {
  console.log("The palettes are not equal!");
}

console.log('All tests passed!');


// TESTING HELPERS 

function deepEqualRecordsOfRecords(
  a: Record<string, Record<string, string>>,
  b: Record<string, Record<string, string>>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!(key in b)) return false;
    if (!deepEqualObj(a[key], b[key])) return false;
  }
  return true;
}

function deepEqualObj(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!(key in b) || a[key] !== b[key]) return false;
  }
  return true;
}

function expectEqualObj(
  actual: Record<string, string> | undefined,
  expected: Record<string, string>,
  desc: string
) {
  if (!actual || !deepEqualObj(actual, expected)) {
    console.error(`❌ Failed: ${desc}`);
    console.error('    Actual  :', actual);
    console.error('    Expected:', expected);
    throw new Error('Test failed');
  }
  console.log(`✅ Passed: ${desc}`);
}

function nameCheck<T extends ColorData> (tcb : ToneCallback<T>, expected : string){
    const actual = tcb.subtone?.name
    const desc = expected + " name check"
    if(actual!==expected){
        console.error(`❌ Failed: ${desc}`);
        console.error('    Actual  :', actual);
        console.error('    Expected:', expected);
        throw new Error('Test failed');
    }else{
        console.log(`✅ Passed: ${desc}`);
    }
}