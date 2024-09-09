/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

// utility functions for type checking

// type definitions
export namespace Types {
  export type Nil = null | undefined;
  export type func = (...args: any[]) => any;

  export type GeneralObject = { [key: string | number | symbol]: any };
  export type Object = { [key: string]: any };
  export type TypedObject<T> = { [key: string]: T };
  export type StringObject = TypedObject<string>;
  export type NumberObject = TypedObject<number>;
  export type BooleanObject = TypedObject<boolean>;
}
type Nil = Types.Nil;
type func = Types.func;
export type GeneralObject = Types.GeneralObject;
export type Object = Types.Object;
export type TypedObject<T> = Types.TypedObject<T>;
export type StringObject = Types.StringObject;
export type NumberObject = Types.NumberObject;
export type BooleanObject = Types.BooleanObject;

// type checking functions
// e.g. isNumber(value) returns if the given value is number
// e.g. isNumber(value,true) returns if the given value is Number
export namespace IsType {
  // types of the functions isString, and so on
  export namespace FuncTypes {
    // a functions that returns true if it is a certain type T, or returns false otherwise.
    export type Is<T> = (data: any) => data is T;

    // expands Is<T>
    // a function that can state if the given value is a primitive type TP or not, or in more generally if it is the wrapper type or not
    // The primitive type is more strict than its wrapper type
    // e.g. string (primitive type) and String (wrapper object type)
    export type IsPrimitiveOrWrapper<TP, TW> = ((
      data: any,
      allowWrapper?: false
    ) => data is TP) &
      ((data: any, allowWrapper: true) => data is TW);
  }
  export type Is<T> = FuncTypes.Is<T>;
  export type IsPrimitiveOrWrapper<TP, TW> = FuncTypes.IsPrimitiveOrWrapper<
    TP,
    TW
  >;

  // get class name of the given data by using the Object.prototype.toString
  type GetClass = (data: unknown) => Nullable<string>;
  const tsMatcher = /^\[object (?<className>[a-zA-Z]+)\]$/;
  export const getClass: GetClass = (data) => {
    try {
      const tsValue = Object.prototype.toString.call(data);
      return mapNullable(
        tsMatcher.exec(tsValue)?.groups,
        (groups) => groups["className"]
      );
    } catch (_) {
      return null;
    }
  };

  // Composers of the functions
  // These functions are used for creating isString, isNumber, and so on
  export namespace Composers {
    // each functions are different in type checking strategies

    // by using Object.prototype.toString
    export const makeIsTypeByToString: MakeIsTypeByToString = <T>(
      tag: String
    ) => {
      const expected = `[object ${tag}]`;
      return (data): data is T =>
        Object.prototype.toString.call(data) === expected;
    };
    type MakeIsTypeByToString = <T>(tag: String) => Is<T>;

    // by using Object.prototype.constructor
    export const makeIsTypeByConstructor: MakeIsTypeByConstructor = <T>(
      constructor: Function
    ) => {
      return (data): data is T => {
        const casted = castToGeneralObject(data);
        if (isNil(casted)) return false;
        return casted.constructor === constructor;
      };
    };
    type MakeIsTypeByConstructor = <T>(constructor: Function) => Is<T>;

    // by using typeof
    export const makeIsTypeByTypeof: MakeIsTypeByTypeof = <T>(
      typeofValue: Typeof
    ) => {
      return (data): data is T => typeof data === typeofValue;
    };
    type MakeIsTypeByTypeof = <T>(typeofValue: Typeof) => Is<T>;
    type Typeof =
      | "string"
      | "number"
      | "bigint"
      | "boolean"
      | "symbol"
      | "undefined"
      | "object"
      | "function";

    // combination of makeIsTypeByInstanceOf and makeIsTypeByTypeOf
    // users can choose whether the checked type should be primitive types or wrapper types
    // when the composed function are used without the second argument, this is equivalent to function by makeIsTypeByTypeof
    export const makeIsTypeHybrid: MakeIsTypeHybrid = <TP, TW>(
      typeofValue: Typeof,
      instance: Function
    ) => {
      return ((data, allowWrapper = false) => {
        return (
          typeof data === typeofValue ||
          (allowWrapper && data instanceof instance)
        );
      }) as IsPrimitiveOrWrapper<TP, TW>;
    };
    type MakeIsTypeHybrid = <TP, TW>(
      typeofValue: Typeof,
      instance: Function
    ) => IsPrimitiveOrWrapper<TP, TW>;
  }
  const makeIsTypeHybrid = Composers.makeIsTypeHybrid;
  const makeIsTypeByTypeOf = Composers.makeIsTypeByTypeof;

  // primitive types & function
  export const isString = makeIsTypeHybrid<string, String>("string", String);
  export const isBoolean = makeIsTypeHybrid<boolean, Boolean>(
    "boolean",
    Boolean
  );
  export const isNumber = makeIsTypeHybrid<number, Number>("number", Number);
  export const isBigInt = makeIsTypeHybrid<bigint, BigInt>("bigint", BigInt);
  export const isSymbol = makeIsTypeHybrid<symbol, Symbol>("symbol", Symbol);
  export const isFunction = makeIsTypeByTypeOf<func>("function");

  // for null and undefined
  export const isNil: Is<Nil> = (data): data is Nil => data == null;
  export const isNull: Is<null> = (data): data is null => data === null;
  export const isUndefined: Is<undefined> = (data): data is undefined =>
    data === undefined;

  // generalized function of Is<T> or IsPrimitiveOrWrapper<TP,TW>
  // This is introduced to handle both Is and IsPrimitiveOrWrapper easily in ArrayFuncs or ObjectFuncs
  type GenericFunc = <T>(data: any, allowWrapper?: boolean) => data is T;

  // array related functions
  export namespace ArrayFuncs {
    // for array whose item is any
    export const isArray: Is<any[]> = (data): data is any[] =>
      Array.isArray(data);

    // for array whose item is certain type
    // e.g. isTypedArray(value,isString) returns if the given value is string[]
    export const isTypedArray = (<T>(
      data: any,
      isTypeForItem: GenericFunc,
      allowWrapper: boolean = false
    ): data is T[] => {
      const arr = castToArrayOrNull(data);
      if (isNil(arr)) return false;
      return arr.every((item) => isTypeForItem(item, allowWrapper ?? false));
    }) as IsTypedArray;
    type IsTypedArray = (<TP, TW>(
      data: any,
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
      allowWrapper?: false
    ) => data is TP[]) &
      (<TP, TW>(
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => data is TW[]) &
      (<T>(data: any, isTypeForItem: Is<T>) => data is T[]);

    // composer of type checker of array whose items are certain type
    export const makeIsTypedArray = (<T, TP, TW>(
      isTypeForItem: GenericFunc
    ) => {
      return ((data: any, allowWrapper: boolean = false) => {
        return (
          isTypedArray as <T>(d: unknown, i: GenericFunc, a?: boolean) => d is T
        )(data, isTypeForItem, allowWrapper);
      }) as Is<T[]> | IsPrimitiveOrWrapper<TP[], TW[]>;
    }) as MakeIsTypedArray;
    type MakeIsTypedArray = (<TP, TW>(
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>
    ) => IsPrimitiveOrWrapper<TP[], TW[]>) &
      (<T>(isTypeForItem: Is<T>) => Is<T[]>);

    export const isStringArray = makeIsTypedArray(isString);
    export const isNumberArray = makeIsTypedArray(isNumber);
    export const isBooleanArray = makeIsTypedArray(isBoolean);

    // check if the given data is an iterable, including normal arrays, NodeList, Collections etc.
    // all of them can be converted to Array with Array.from
    export const isIterable: Is<Iterable<any>> = (
      data
    ): data is Iterable<any> => {
      const obj = castToGeneralObject(data);
      if (isNil(obj)) return false;
      return typeof obj[Symbol.iterator] === "function";
    };
  }

  // object related functions
  export namespace ObjectFuncs {
    // check if the given data is a dictionary-like object
    // a dict-like object and cannot be iterated
    export const isObject: Is<Object> = (data): data is Object =>
      typeof data === "object" && data !== null && !isIterable(data);

    // check if the given data is an empty object: {}
    // The argument should be guranteed to be an Object value by castToObjectOrNull before you use the function
    export const isEmptyObject = (data: Object) =>
      Object.keys(data).length === 0;

    // for dict-like object whose item is certain type
    // e.g. isTypedObject(value,isNumber) returns if the given value is { [key:string]: number }
    export const isTypedObject = (<T>(
      data: any,
      isTypeForItem: GenericFunc,
      allowWrapper: boolean = false
    ): data is TypedObject<T> => {
      const obj = castToObjectOrNull(data);
      if (isNil(obj)) return false;
      return Object.values(obj).every((item) =>
        isTypeForItem(item, allowWrapper ?? false)
      );
    }) as IsTypedObject;
    type IsTypedObject = (<TP, TW>(
      data: any,
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
      allowWrapper?: false
    ) => data is TypedObject<TP>) &
      (<TP, TW>(
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => data is TypedObject<TW>) &
      (<T>(data: any, isTypeForItem: Is<T>) => data is TypedObject<T>);

    // composer of type checker of object whose items are certain type
    export const makeIsTypedObject = (<T, TP, TW>(
      isTypeForItem: GenericFunc
    ) => {
      return ((data: any, allowWrapper: boolean = false) => {
        return (
          isTypedObject as <T>(d: any, i: GenericFunc, a?: boolean) => d is T
        )(data, isTypeForItem, allowWrapper);
      }) as
        | Is<TypedObject<T>>
        | IsPrimitiveOrWrapper<TypedObject<TP>, TypedObject<TW>>;
    }) as MakeIsTypedObject;
    type MakeIsTypedObject = (<TP, TW>(
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>
    ) => IsPrimitiveOrWrapper<TypedObject<TP>, TypedObject<TW>>) &
      (<T>(isTypeForItem: Is<T>) => Is<TypedObject<T>>);

    export const isStringObject = makeIsTypedObject(isString);
    export const isNumberObject = makeIsTypedObject(isNumber);
    export const isBooleanObject = makeIsTypedObject(isBoolean);
  }
}
export const isString = IsType.isString;
export const isBoolean = IsType.isBoolean;
export const isNumber = IsType.isNumber;
export const isBigInt = IsType.isBigInt;
export const isSymbol = IsType.isSymbol;
export const isFunction = IsType.isFunction;
export const isNil = IsType.isNil;
export const isNull = IsType.isNull;
export const isUndefined = IsType.isUndefined;
export const isArray = IsType.ArrayFuncs.isArray;
export const isTypedArray = IsType.ArrayFuncs.isTypedArray;
export const isStringArray = IsType.ArrayFuncs.isStringArray;
export const isNumberArray = IsType.ArrayFuncs.isNumberArray;
export const isBooleanArray = IsType.ArrayFuncs.isBooleanArray;
export const isIterable = IsType.ArrayFuncs.isIterable;
export const isObject = IsType.ObjectFuncs.isObject;
export const isEmptyObject = IsType.ObjectFuncs.isEmptyObject;
export const isTypedObject = IsType.ObjectFuncs.isTypedObject;
export const isStringObject = IsType.ObjectFuncs.isStringObject;
export const isNumberObject = IsType.ObjectFuncs.isNumberObject;
export const isBooleanObject = IsType.ObjectFuncs.isBooleanObject;

// The functions that treat the given value to the certain types, or returns null if they can't.
// They depend on the IsType functions
// e.g. castToStringOrNull(value)
// if the given value is a string, it returns the value
// if the given value is not a string, it returns null
// You can unwrap the returned value easily with isNil and conditional statement
export namespace CastToTypeOrNull {
  type Is<T> = IsType.Is<T>;
  type IsPrimitiveOrWrapper<TP, TW> = IsType.IsPrimitiveOrWrapper<TP, TW>;

  // types of the functions CastToStringOrNull, and so on
  export namespace FuncTypes {
    export type CastToOrNullFor<T> = (data: any) => Nullable<T>;

    export type CastToOrNullForPoW<TP, TW> = ((
      data: any,
      allowWrapper?: false
    ) => Nullable<TP>) &
      ((data: any, allowWrapper: true) => Nullable<TW>);
  }
  type CastToOrNullFor<T> = FuncTypes.CastToOrNullFor<T>;
  type CastToOrNullForPoW<TP, TW> = FuncTypes.CastToOrNullForPoW<TP, TW>;

  // generic function of Is<T> or IsPrimitiveOrWrapper<TP,TW>
  type GenericFunc = <T>(data: any, allowWrapper?: boolean) => data is T;

  // composer of castToStringOrNull, and so on
  export const makeCastToOrNullForType = (<T, TP, TW>(
    isType: GenericFunc,
    allowWrapper: boolean = false
  ) => {
    return ((data: any) => (isType(data, allowWrapper) ? data : null)) as
      | CastToOrNullFor<T>
      | CastToOrNullForPoW<TP, TW>;
  }) as MakeCastToOrNullForType;
  type MakeCastToOrNullForType = (<TP, TW>(
    isType: IsPrimitiveOrWrapper<TP, TW>
  ) => CastToOrNullForPoW<TP, TW>) &
    (<T>(isType: Is<T>) => CastToOrNullFor<T>);

  // create functions for types
  // e.g. castToStringOrNull(value:any) => Nullable<string>
  // e.g. castToStringOrNull(value:any,true) => Nullable<String>
  export const castToStringOrNull = makeCastToOrNullForType<string, String>(
    isString
  );
  export const castToNumberOrNull = makeCastToOrNullForType<number, Number>(
    isNumber
  );
  export const castToBooleanOrNull = makeCastToOrNullForType<boolean, Boolean>(
    isBoolean
  );
  export const castToBigIntOrNull = makeCastToOrNullForType<bigint, BigInt>(
    isBigInt
  );
  export const castToSymbolOrNull = makeCastToOrNullForType<symbol, Symbol>(
    isSymbol
  );
  export const castToFunctionOrNull = makeCastToOrNullForType<func>(isFunction);
  export const castToArrayOrNull = makeCastToOrNullForType<any[]>(isArray);
  export const castToStringArrayOrNull = makeCastToOrNullForType<
    string[],
    String[]
  >(isStringArray);
  export const castToNumberArrayOrNull = makeCastToOrNullForType<
    number[],
    Number[]
  >(isNumberArray);
  export const castToBooleanArrayOrNull = makeCastToOrNullForType<
    boolean[],
    Boolean[]
  >(isBooleanArray);
  export const castToObjectOrNull = makeCastToOrNullForType<Object>(isObject);
  export const castToStringObjectOrNull = makeCastToOrNullForType<
    TypedObject<string>,
    TypedObject<String>
  >(isStringObject);
  export const castToNumberObjectOrNull = makeCastToOrNullForType<
    TypedObject<number>,
    TypedObject<Number>
  >(isNumberObject);
  export const castToBooleanObjectOrNull = makeCastToOrNullForType<
    TypedObject<boolean>,
    TypedObject<Boolean>
  >(isBooleanObject);

  // This cannot be failed (probably)
  export const castToGeneralObject: CastToOrNullFor<GeneralObject> = (data) =>
    data as Nullable<GeneralObject>;

  // functions for casting to typed arrays or typed objects
  // e.g. castToTypedArrayOrNull(value:any,isNumber) => Nullable<number[]>
  export namespace TypedCollection {
    export const castToTypedArrayOrNull = (<T>(
      data: any,
      isTypeForItem: GenericFunc,
      allowWrapper: boolean = false
    ): Nullable<T[]> => {
      return (
        isTypedArray as (
          data: any,
          isTypeForItem: GenericFunc,
          allowWrapper?: boolean
        ) => data is T[]
      )(data, isTypeForItem, allowWrapper ?? false)
        ? data
        : null;
    }) as CastToTypedArrayOrNull;
    type CastToTypedArrayOrNull = (<TP, TW>(
      data: any,
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
      allowWrapper?: false
    ) => Nullable<TP[]>) &
      (<TP, TW>(
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => Nullable<TW[]>) &
      (<T>(data: any, isTypeForItem: Is<T>) => Nullable<T[]>);

    export const castToTypedObjectOrNull = (<T>(
      data: any,
      isTypeForItem: GenericFunc,
      allowWrapper: boolean = false
    ): Nullable<TypedObject<T>> => {
      return (
        isTypedObject as (
          data: any,
          isTypeForItem: GenericFunc,
          allowWrapper?: boolean
        ) => data is TypedObject<T>
      )(data, isTypeForItem, allowWrapper ?? false)
        ? data
        : null;
    }) as CastToTypedObjectOrNull;
    type CastToTypedObjectOrNull = (<TP, TW>(
      data: any,
      isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
      allowWrapper?: false
    ) => Nullable<TypedObject<TP>>) &
      (<TP, TW>(
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => Nullable<TypedObject<TW>>) &
      (<T>(data: any, isTypeForItem: Is<T>) => Nullable<TypedObject<T>>);
  }

  // WIP: composers of castToTypedArrayOrNull and castToTypedObjectOrNull
  export namespace Composers {
    // The output function (castToTyped***OrNull)
    export type CastToOrNullForCollection<TC, TI, TCP, TIP, TCW, TIW> = ((
      data: any,
      isTypeForItem: Is<TI>
    ) => Nullable<TC>) &
      ((
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper?: false
      ) => Nullable<TCP>) &
      ((
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper: true
      ) => Nullable<TCW>);

    // a collection variant of Is<T> or IsPrimitiveOrWrapper<TP,TW>
    // like IsTypedArray or IsTypedObject
    type IsCollection<TC, TI, TCP, TIP, TCW, TIW> = ((
      data: any,
      isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
      allowWrapper?: false
    ) => data is TCP) &
      ((
        data: any,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper: true
      ) => data is TCW) &
      ((data: any, isTypeForItem: Is<TI>) => data is TC);

    // generic function of IsCollection<TC,TI,TCP,TIP,TCW,TIW>
    // This is introduced to handle IsCollection easily in the implementation
    type GenericFuncForCollection<T> = (
      data: any,
      isTypeForItem: GenericFunc,
      allowWrapper?: boolean
    ) => data is T;

    // The main composer
    export const makeCastToOrNullForCollection = (<TC, TI, TCP, TIP, TCW, TIW>(
      isTypeForCollection: IsCollection<TC, TI, TCP, TIP, TCW, TIW>
    ) => {
      return (
        data: any,
        isTypeForItem: GenericFunc,
        allowWrapper: boolean = false
      ): Nullable<TC | TCP | TCW> =>
        (isTypeForCollection as GenericFuncForCollection<TC | TCP | TCW>)(
          data,
          isTypeForItem,
          allowWrapper ?? false
        )
          ? data
          : null;
    }) as MakeCastToOrNullForCollection;
    type MakeCastToOrNullForCollection = <TC, TI, TCP, TIP, TCW, TIW>(
      isType: IsCollection<TC, TI, TCP, TIP, TCW, TIW>
    ) => CastToOrNullForCollection<TC, TI, TCP, TIP, TCW, TIW>;
  }
}
export const castToStringOrNull = CastToTypeOrNull.castToStringOrNull;
export const castToNumberOrNull = CastToTypeOrNull.castToNumberOrNull;
export const castToBooleanOrNull = CastToTypeOrNull.castToBooleanOrNull;
export const castToBigIntOrNull = CastToTypeOrNull.castToBigIntOrNull;
export const castToSymbolOrNull = CastToTypeOrNull.castToSymbolOrNull;
export const castToFunctionOrNull = CastToTypeOrNull.castToFunctionOrNull;
export const castToArrayOrNull = CastToTypeOrNull.castToArrayOrNull;
export const castToTypedArrayOrNull =
  CastToTypeOrNull.TypedCollection.castToTypedArrayOrNull;
export const castToStringArrayOrNull = CastToTypeOrNull.castToStringArrayOrNull;
export const castToNumberArrayOrNull = CastToTypeOrNull.castToNumberArrayOrNull;
export const castToBooleanArrayOrNull =
  CastToTypeOrNull.castToBooleanArrayOrNull;
export const castToObjectOrNull = CastToTypeOrNull.castToObjectOrNull;
export const castToTypedObjectOrNull =
  CastToTypeOrNull.TypedCollection.castToTypedObjectOrNull;
export const castToStringObjectOrNull =
  CastToTypeOrNull.castToStringObjectOrNull;
export const castToNumberObjectOrNull =
  CastToTypeOrNull.castToNumberObjectOrNull;
export const castToBooleanObjectOrNull =
  CastToTypeOrNull.castToBooleanObjectOrNull;
export const castToGeneralObject = CastToTypeOrNull.castToGeneralObject;

// utility functions to handle Nullable<T>
export namespace NullableUtils {
  // equivalent of `map`, `and_then` in Rust `Option<T>`
  export const mapNullable = <T, U>(
    value: Nullable<T>,
    func: (val: T) => Nullable<U>
  ): Nullable<U> => (value != null ? func(value) : (value as Nullable<U>));

  // equivalent of `or_else` in Rust `Option<T>`
  export const orElseNullable = <T>(
    value: Nullable<T>,
    func: () => Nullable<T>
  ): Nullable<T> => (value != null ? value : func());

  // equivalent of `unwrap_or_else` in Rust `Option<T>`
  export const unwrapOrNullable = <T>(value: Nullable<T>, func: () => T): T =>
    value != null ? value : func();
}
export const mapNullable = NullableUtils.mapNullable;
export const orElseNullable = NullableUtils.orElseNullable;
export const unwrapOrNullable = NullableUtils.unwrapOrNullable;