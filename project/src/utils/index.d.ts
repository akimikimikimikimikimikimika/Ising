import React from "react";

declare global {
  type Nil = null | undefined;
  type Nullable<T> = T | Nil;
  type StateSetter<T> = React.Dispatch<React.SetStateAction<T>> | ((newVal:T) => void);
  type Literal<T> = T[keyof T];
}