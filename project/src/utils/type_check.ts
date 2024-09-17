// utility functions for type checking

// type definitions
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Types {
  export type Nil = null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type func = (...args: any[]) => any;

  export type GeneralObject = { [key: string | number | symbol]: unknown };
  export type TypedArray<T> = T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Array = TypedArray<any>;
  export type TypedObject<T> = { [key: string]: T };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Object = TypedObject<any>;
  export type StringObject = TypedObject<string>;
  export type NumberObject = TypedObject<number>;
  export type BooleanObject = TypedObject<boolean>;
  export type EmptyOjbect = TypedObject<never>;

  // The value `typeof` keyword can emit
  export type Typeof =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function";

  // get the wrapper types of the primitive types + function
  export type ToWrapper<T extends Primitives> =
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    T extends string  ? String   :
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    T extends number  ? Number   :
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    T extends boolean ? Boolean  :
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    T extends bigint  ? BigInt   :
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    T extends symbol  ? Symbol   :
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    T extends func    ? Function :
    never;

  // primitive types + function
  export type Primitives = string | number | boolean | bigint | symbol | func;
}
export type Nil = Types.Nil;
export type func = Types.func;
export type GeneralObject = Types.GeneralObject;
export type Object = Types.Object;
export type TypedObject<T> = Types.TypedObject<T>;
export type Array = Types.Array;
export type TypedArray<T> = Types.TypedArray<T>;
export type StringObject = Types.StringObject;
export type NumberObject = Types.NumberObject;
export type BooleanObject = Types.BooleanObject;
export type EmptyObject = Types.EmptyOjbect;
export type Typeof = Types.Typeof;
export type Primitives = Types.Primitives;
export type ToWrapper<T extends Primitives> = Types.ToWrapper<T>;

// type checking functions
// e.g. isNumber(value) returns if the given value is number
// e.g. isNumber(value,true) returns if the given value is Number
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace IsType {
  // a functions that returns true if it is a certain type T, or returns false otherwise.
  export type Is<To extends From, From = unknown> = (data: From) => data is To;

  // expands Is<T>
  // a function that can state if the given value is a primitive type TP or not, or in more generally if it is the wrapper type or not
  // The primitive type is more strict than its wrapper type
  // e.g. string (primitive type) and String (wrapper object type)
  export type IsPrimitiveOrWrapper<
    Primitive extends From,
    Wrapper extends From,
    From = unknown
  > = (
    ((data: From, allowWrapper?: false) => data is Primitive) &
    ((data: From, allowWrapper : true ) => data is Wrapper)
  );

  // safe version of IsPrimitiveOrWrapper
  // the type parameter only accepts actual primitive types
  type IsPorWSafe<
    Primitive extends Primitives & From,
    From = unknown
  > = (
    // both Primitive and ToWrapper<Primitive> should be From
    ToWrapper<Primitive> extends From ?
    IsPrimitiveOrWrapper<Primitive, ToWrapper<Primitive>, From> : never
  );

  // get class name of the given data by using the Object.prototype.toString
  type GetClass = (data: unknown) => Nullable<string>;
  const tsMatcher = /^\[object (?<className>[a-zA-Z]+)\]$/;
  export const getClass: GetClass = (data) => {
    try {
      const tsValue = Object.prototype.toString.call(data);
      return mapNullable(
        tsMatcher.exec(tsValue)?.groups,
        (groups) => groups.className,
      );
    } catch {
      return null;
    }
  };

  // Composers of the functions
  // These functions are used for creating isString, isNumber, and so on
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Composers {
    // each functions are different in type checking strategies

    // by using Object.prototype.toString
    export const makeIsTypeByToString = <T>(tag: string): Is<T> => {
      const expected = `[object ${tag}]`;
      return (data): data is T =>
        Object.prototype.toString.call(data) === expected;
    };

    // by using Object.prototype.constructor
    export const makeIsTypeByConstructor = <T>(constructorFn: func): Is<T> => {
      return (data): data is T => {
        const casted = castToGeneralObject(data);
        if (isNil(casted)) return false;
        return casted.constructor === constructorFn;
      };
    };

    // by using typeof
    export const makeIsTypeByTypeof = <T>(typeofValue: Typeof): Is<T> => {
      return (data): data is T => {
        return typeof data === typeofValue;
      };
    };

    // combination of makeIsTypeByInstanceOf and makeIsTypeByTypeOf
    // users can choose whether the checked type should be primitive types or wrapper types
    // when the composed function are used without the second argument, this is equivalent to function by makeIsTypeByTypeof
    export const makeIsTypeHybrid = <T extends Primitives>(
      typeofValue: Typeof,
      instance: func,
    ) => {
      return ((data, allowWrapper = false) => {
        return (
          typeof data === typeofValue ||
          (allowWrapper && data instanceof instance)
        );
      }) as IsPorWSafe<T>;
    };
  }
  const makeIsTypeHybrid = Composers.makeIsTypeHybrid;
  const makeIsTypeByTypeOf = Composers.makeIsTypeByTypeof;

  // primitive types & function
  export const isString = makeIsTypeHybrid<string>("string", String);
  export const isBoolean = makeIsTypeHybrid<boolean>("boolean", Boolean);
  export const isNumber = makeIsTypeHybrid<number>("number", Number);
  export const isBigInt = makeIsTypeHybrid<bigint>("bigint", BigInt);
  export const isSymbol = makeIsTypeHybrid<symbol>("symbol", Symbol);
  export const isFunction = makeIsTypeByTypeOf<func>("function");

  // for null and undefined
  export const isNil: Is<Nil> = (data): data is Nil => data == null;
  export const isNull: Is<null> = (data): data is null => data === null;
  export const isUndefined: Is<undefined> = (data): data is undefined =>
    data === undefined;

  // generalized function of Is<T> or IsPrimitiveOrWrapper<TP,TW>
  // This is introduced internally to handle both Is and IsPrimitiveOrWrapper easily in ArrayFuncs or ObjectFuncs
  type GenericFunc = <T>(data: unknown, allowWrapper?: boolean) => data is T;

  // array related functions
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace ArrayFuncs {
    // for array whose item is any type
    export const isArray: Is<Array> = (data): data is Array =>
      Array.isArray(data);

    // for array whose item is certain type
    // e.g. isTypedArray(value,isString) returns if the given value is string[]
    export const isTypedArray = (<T>(
      data: unknown,
      isTypeForItem: GenericFunc,
      allowWrapper = false,
    ): data is T[] => {
      // convert to any[] in order to iterate over its items
      const arr = castToArrayOrNull(data);
      if (isNil(arr)) return false;

      return arr.every((item) => isTypeForItem(item, allowWrapper ?? false));
    }) as IsTypedArray;

    type IsTypedArray = IsTypedArrayForAll & IsTypedArrayForPrimitives;

    type IsTypedArrayForAll = (
      (<T>(
        data: unknown,
        isTypeForItem: Is<T>
      ) => data is T[])
    );

    type IsTypedArrayForPrimitives = (
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper?: false
      ) => data is TP[]) &
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => data is TW[])
    );

    // composer of type checker of array whose items are certain type
    export const makeIsTypedArray = (
      // T1, T2, T3: temporary type parameter to handle values
      <T1, T2, T3>(isTypeForItem: GenericFunc) => {
        // type definitions used internally
        type ITAGeneric = <T>(d: unknown, i: GenericFunc, a?: boolean) => d is T;
        type Output = (
          Is<T1[]> |
          IsPrimitiveOrWrapper<T2[], T3[]>
        );

        return (
          (data: unknown, allowWrapper = false) => (
            (isTypedArray as ITAGeneric)(data, isTypeForItem, allowWrapper)
          )
        ) as Output;
      }
    ) as MakeIsTypedArray;

    type MakeIsTypedArray = (
      (
        <TP, TW>(
          isTypeForItem: IsPrimitiveOrWrapper<TP, TW>
        ) => IsPrimitiveOrWrapper<TP[], TW[]>
      ) &
      (<T>(isTypeForItem: Is<T>) => Is<T[]>)
    );

    export const isStringArray = makeIsTypedArray(isString);
    export const isNumberArray = makeIsTypedArray(isNumber);
    export const isBooleanArray = makeIsTypedArray(isBoolean);

    // check if the given data is an iterable, including normal arrays, NodeList, Collections etc.
    // all of them can be converted to Array with Array.from
    export const isIterable: Is<Iterable<unknown>> = (
      data,
    ): data is Iterable<unknown> => {
      const obj = castToGeneralObject(data);
      if (isNil(obj)) return false;
      return isFunction(obj[Symbol.iterator]);
    };
  }

  // object related functions
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace ObjectFuncs {
    // check if the given data is a dictionary-like object
    // a dict-like object and cannot be iterated
    export const isObject: Is<Object> = (data): data is Object =>
      typeof data === "object" && data !== null && !isIterable(data);

    // check if the given data is an empty object: {}
    // The argument should be guranteed to be an Object value by castToObjectOrNull before you use the function
    export const isEmptyObject: Is<EmptyObject, Object> =
      (data): data is EmptyObject => Object.keys(data).length === 0;

    // for dict-like object whose item is certain type
    // e.g. isTypedObject(value,isNumber) returns if the given value is { [key:string]: number }
    export const isTypedObject = (<T>(
      data: unknown,
      isTypeForItem: GenericFunc,
      allowWrapper = false,
    ): data is TypedObject<T> => {
      // convert to TypedObject<any[]> in order to iterate over its values
      const obj = castToObjectOrNull(data);

      if (isNil(obj)) return false;
      return Object.values(obj).every((item) =>
        isTypeForItem(item, allowWrapper ?? false),
      );
    }) as IsTypedObject;

    type IsTypedObject = IsTypedObjectForAll & IsTypedObjectForPrimitives;

    type IsTypedObjectForAll = (
      (<T>(
        data: unknown,
        isTypeForItem: Is<T>
      ) => data is TypedObject<T>)
    );

    type IsTypedObjectForPrimitives = (
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper?: false
      ) => data is TypedObject<TP>) &
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true
      ) => data is TypedObject<TW>)
    );

    // composer of type checker of object whose items are certain type
    export const makeIsTypedObject = (
      // T1, T2, T3: temporary type parameter to handle values
      <T1, T2, T3>(isTypeForItem: GenericFunc) => {
        // type definitions used internally
        type ITOGeneric = <T>(d: unknown, i: GenericFunc, a?: boolean) => d is T;
        type Output = (
          Is<TypedObject<T1>> |
          IsPrimitiveOrWrapper<TypedObject<T2>, TypedObject<T3>>
        );

        return (
          (data: unknown, allowWrapper = false) => (
            (isTypedObject as ITOGeneric)(data, isTypeForItem, allowWrapper)
          )
        ) as Output;
      }
    ) as MakeIsTypedObject;

    type MakeIsTypedObject = (
      (
        <TP, TW>(
          isTypeForItem: IsPrimitiveOrWrapper<TP, TW>
        ) => IsPrimitiveOrWrapper<TypedObject<TP>, TypedObject<TW>>
      ) &
      (<T>(isTypeForItem: Is<T>) => Is<TypedObject<T>>)
    );

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
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CastToTypeOrNull {
  type Is<T> = IsType.Is<T>;
  type IsPrimitiveOrWrapper<TP, TW> = IsType.IsPrimitiveOrWrapper<TP, TW>;

  // types of the functions CastToStringOrNull, and so on
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace FuncTypes {
    export type CastToOrNullFor<T> = (data: unknown) => Nullable<T>;

    export type CastToOrNullForPoW<TP, TW> = (
      ((data: unknown, allowWrapper?: false) => Nullable<TP>) &
      ((data: unknown, allowWrapper : true ) => Nullable<TW>)
    );
  }
  type CastToOrNullFor<T> = FuncTypes.CastToOrNullFor<T>;
  type CastToOrNullForPoW<TP, TW> = FuncTypes.CastToOrNullForPoW<TP, TW>;

  // generalized function of Is<T> or IsPrimitiveOrWrapper<TP,TW>
  // This is introduced internally to handle both Is and IsPrimitiveOrWrapper easily
  type GenericFunc = <T>(data: unknown, allowWrapper?: boolean) => data is T;

  // composer of castToStringOrNull, and so on
  export const makeCastToOrNullForType = (
    // T1, T2, T3, T4: temporary type parameter to handle values
    <T1, T2, T3, T4>(isType: GenericFunc, allowWrapper = false) => {
      // type definition used internally
      type Output = CastToOrNullFor<T1> | CastToOrNullForPoW<T2, T3>;

      return (
        (data: unknown) =>
          (isType<T4>(data, allowWrapper) ? data : null)
      ) as Output;
    }
  ) as MakeCastToOrNullForType;

  type MakeCastToOrNullForType = (
    (
      <T extends Primitives>(
        isType: IsPrimitiveOrWrapper<T, ToWrapper<T>>
      ) => CastToOrNullForPoW<T, ToWrapper<T>>
    ) &
    (
      <T extends Primitives>(
        isType: IsPrimitiveOrWrapper<T[], (ToWrapper<T>)[]>
      ) => CastToOrNullForPoW<T[], (ToWrapper<T>)[]>
    ) &
    (
      <T extends Primitives>(
        isType: IsPrimitiveOrWrapper<TypedObject<T>, TypedObject<ToWrapper<T>>>
      ) => CastToOrNullForPoW<TypedObject<T>, TypedObject<ToWrapper<T>>>
    ) &
    (
      <TP, TW>(isType: IsPrimitiveOrWrapper<TP, TW>)
      => CastToOrNullForPoW<TP, TW>
    ) &
    (<T>(isType: Is<T>) => CastToOrNullFor<T>)
  );

  // create functions for types
  // e.g. castToStringOrNull(value:any) => Nullable<string>
  // e.g. castToStringOrNull(value:any,true) => Nullable<String>

  export const castToStringOrNull =
    makeCastToOrNullForType<string>(isString);
  export const castToNumberOrNull =
    makeCastToOrNullForType<number>(isNumber);
  export const castToBooleanOrNull =
    makeCastToOrNullForType<boolean>(isBoolean);
  export const castToBigIntOrNull =
    makeCastToOrNullForType<bigint>(isBigInt);
  export const castToSymbolOrNull =
    makeCastToOrNullForType<symbol>(isSymbol);

  export const castToFunctionOrNull = makeCastToOrNullForType<func>(isFunction);

  export const castToArrayOrNull = makeCastToOrNullForType<Array>(isArray);
  export const castToStringArrayOrNull =
    makeCastToOrNullForType<string>(isStringArray);
  export const castToNumberArrayOrNull =
    makeCastToOrNullForType<number>(isNumberArray);
  export const castToBooleanArrayOrNull =
    makeCastToOrNullForType<boolean>(isBooleanArray);

  export const castToObjectOrNull = makeCastToOrNullForType<Object>(isObject);
  export const castToStringObjectOrNull =
    makeCastToOrNullForType<string>(isStringObject);
  export const castToNumberObjectOrNull =
    makeCastToOrNullForType<number>(isNumberObject);
  export const castToBooleanObjectOrNull =
    makeCastToOrNullForType<boolean>(isBooleanObject);

  // This cannot be failed (probably)
  export const castToGeneralObject: CastToOrNullFor<GeneralObject> = (data) =>
    data as Nullable<GeneralObject>;

  // functions for casting to typed arrays or typed objects
  // e.g. castToTypedArrayOrNull(value:any,isNumber) => Nullable<number[]>
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace TypedCollection {
    export const castToTypedArrayOrNull = (
      <T>(
        data: unknown,
        isTypeForItem: GenericFunc,
        allowWrapper = false,
      ): Nullable<T[]> => {
        // type definition used internally
        type ITAGeneral = (
          data: unknown,
          isTypeForItem: GenericFunc,
          allowWrapper?: boolean,
        ) => data is T[];

        return (
          (isTypedArray as ITAGeneral)(
            data, isTypeForItem,
            allowWrapper ?? false
          ) ? data : null
        );
      }
    ) as CastToTypedArrayOrNull;

    type CastToTypedArrayOrNull =
      & CastToTypedArrayOrNullForAll
      & CastToTypedArrayOrNullForPrimitives;

    type CastToTypedArrayOrNullForAll = (
      <T>(
        data: unknown,
        isTypeForItem: Is<T>
      ) => Nullable<T[]>
    );

    type CastToTypedArrayOrNullForPrimitives = (
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper?: false,
      ) => Nullable<TP[]>) &
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true,
      ) => Nullable<TW[]>)
    );

    export const castToTypedObjectOrNull = (
      <T>(
        data: unknown,
        isTypeForItem: GenericFunc,
        allowWrapper = false,
      ): Nullable<TypedObject<T>> => {
        // type definition used internally
        type ITOGeneral = (
          data: unknown,
          isTypeForItem: GenericFunc,
          allowWrapper?: boolean,
        ) => data is TypedObject<T>;

        return (
          (isTypedObject as ITOGeneral)(
            data, isTypeForItem,
            allowWrapper ?? false
          ) ? data : null
        );
      }
    ) as CastToTypedObjectOrNull;

    type CastToTypedObjectOrNull =
      & CastToTypedObjectOrNullForAll
      & CastToTypedObjectOrNullForPrimitives;

    type CastToTypedObjectOrNullForAll = (
      <T>(
        data: unknown,
        isTypeForItem: Is<T>
      ) => Nullable<TypedObject<T>>
    );

    type CastToTypedObjectOrNullForPrimitives = (
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper?: false,
      ) => Nullable<TypedObject<TP>>) &
      (<TP, TW>(
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TP, TW>,
        allowWrapper: true,
      ) => Nullable<TypedObject<TW>>)
    );
  }

  // WIP: composers of castToTypedArrayOrNull and castToTypedObjectOrNull
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Composers {
    // The output function (castToTyped***OrNull)
    export type CastToOrNullForCollection<TC, TI, TCP, TIP, TCW, TIW> = (
      ((
        data: unknown,
        isTypeForItem: Is<TI>,
      ) => Nullable<TC>) &
      ((
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper?: false,
      ) => Nullable<TCP>) &
      ((
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper: true,
      ) => Nullable<TCW>)
    );

    // a collection variant of Is<T> or IsPrimitiveOrWrapper<TP,TW>
    // like IsTypedArray or IsTypedObject
    type IsCollection<TC, TI, TCP, TIP, TCW, TIW> = (
      ((
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper?: false,
      ) => data is TCP) &
      ((
        data: unknown,
        isTypeForItem: IsPrimitiveOrWrapper<TIP, TIW>,
        allowWrapper: true,
      ) => data is TCW) &
      ((data: unknown, isTypeForItem: Is<TI>) => data is TC)
    );

    // generic function of IsCollection<TC,TI,TCP,TIP,TCW,TIW>
    // This is introduced to handle IsCollection easily in the implementation
    type GenericFuncForCollection<T> = (
      data: unknown,
      isTypeForItem: GenericFunc,
      allowWrapper?: boolean,
    ) => data is T;

    // The main composer
    export const makeCastToOrNullForCollection = (
      <TC, TI, TCP, TIP, TCW, TIW>(
        isTypeForCollection: IsCollection<TC, TI, TCP, TIP, TCW, TIW>,
      ) => {
        type Func = GenericFuncForCollection<TC | TCP | TCW>;
        return (
          data: unknown,
          isTypeForItem: GenericFunc,
          allowWrapper: boolean,
        ): Nullable<TC | TCP | TCW> => (
          (isTypeForCollection as Func)(
            data, isTypeForItem,
            allowWrapper ?? false
          ) ? data : null
        );
      }
    ) as MakeCastToOrNullForCollection;

    type MakeCastToOrNullForCollection = <TC, TI, TCP, TIP, TCW, TIW>(
      isType: IsCollection<TC, TI, TCP, TIP, TCW, TIW>,
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
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace NullableUtils {
  // equivalent of `map`, `and_then` in Rust `Option<T>`
  // if the given value is not null, call the given function and pass the return
  // if the given value is null, just return null
  export const mapNullable =
    <T, U>(
      value: Nullable<T>,
      func: (val: T) => Nullable<U>
    ): Nullable<U> => (
      value != null ? func(value) : (value as Nullable<U>)
    );

  // equivalent of `or_else` in Rust `Option<T>`
  // if the given value is not null, just return it
  // if the given value is null, call the given function and pass the return
  export const orElseNullable =
    <T>(
      value: Nullable<T>,
      func: () => Nullable<T>,
    ): Nullable<T> => (
      value != null ? value : func()
    );

  // equivalent of `unwrap_or_else` in Rust `Option<T>`
  // always returns T by calling the given function if the given value is null
  export const unwrapOrNullable =
    <T>(
      value: Nullable<T>,
      func: () => T
    ): T => (
      value != null ? value : func()
    );

  // equality check for nullable type
  // null and undefined are treated as equivalent values
  // if a function provided in 3rd arguments, it is used for check equality of unwrapped values
  export const nullableEq: NullableEq = (
    lhs, rhs,
    equalityFnForUnwrapped = (lhs, rhs) => lhs === rhs,
  ) => {
    if (isNil(lhs) && isNil(rhs)) return true;
    if (isNil(lhs) || isNil(rhs)) return false;
    return equalityFnForUnwrapped(lhs, rhs);
  };

  type NullableEq = <T>(
    lhs: Nullable<T>,
    rhs: Nullable<T>,
    equalityFnForUnwrapped?: (lhs: T, rhs: T) => boolean,
  ) => boolean;
}
export const mapNullable = NullableUtils.mapNullable;
export const orElseNullable = NullableUtils.orElseNullable;
export const unwrapOrNullable = NullableUtils.unwrapOrNullable;
export const nullableEq = NullableUtils.nullableEq;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FuncUtils {
  // get tuple of arguments from the function
  export type ArgsOf<Fn extends func> = (
    Fn extends (...args: infer A) => unknown ? A : never
  );

  // get return value type from the function
  export type ReturnOf<Fn extends func> = (
    Fn extends (...args: unknown[]) => infer R ? R : never
  );

  // call nullable function if we can unwrap it
  // 1st argument: the nullable function
  // other arguments: the arguments to pass the function (if called)
  // the returned value is nullable return type of the given function
  export const callIfUnwrappable: CallIfUnwrappable =
    (fn, ...args) => !isNil(fn) ? fn(...args) : fn;

  type CallIfUnwrappable = <Fn extends func>(
    fn: Nullable<Fn>,
    ...args: ArgsOf<Fn>
  ) => Nullable<ReturnOf<Fn>>;
}
export type ArgsOf<F extends func> = FuncUtils.ArgsOf<F>;
export type ReturnOf<F extends func> = FuncUtils.ReturnOf<F>;
export const callIfUnwrappable = FuncUtils.callIfUnwrappable;
