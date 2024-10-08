/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useCallback } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { indexToXY, isNil } from "../utils/utils";
import { onColor, offColor } from "../utils/consts";
import { CanvasContext as Context } from "../renderer_utils/types";
import { CanvasMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => {

  // canvas
  const canvasRef = useRef<HTMLCanvasElement|null>(null);

  // canvas context
  type Context2D = CanvasRenderingContext2D;
  type ContextBitmap = ImageBitmapRenderingContext;
  const context2dRef = useRef<Nullable<Context2D>>(null);
  const contextBitmapRef = useRef<Nullable<ContextBitmap>>(null);

  // activate context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (isNil(canvas)) return;

    const context = canvas.getContext(props.canvasContext);
    if (isNil(context)) {
      props.notifyFailure("Failed to create context");
      return;
    }
    switch (props.canvasContext) {
      case Context.TwoD: {
        context2dRef.current = context as Context2D;
        contextBitmapRef.current = null;
      } break;
      case Context.Bitmap: {
        contextBitmapRef.current = context as ContextBitmap;
        context2dRef.current = null;
      }
    }
  }, [canvasRef.current]);

  // drawing info
  type Info = {
    cellWidth: number, cellHeight: number,
    side: number
  };
  const infoRef = useRef<Info>({
    cellWidth: 0, cellHeight: 0, side: 0
  });

  // image data array (for bitmap rendering)
  const arrayRef = useRef<Uint8ClampedArray>(Uint8ClampedArray.from({ length: 0 }));

  // previous state
  const previousBits = useRef<Bits>([]);

  // drawing bit
  const drawBit = useCallback(
    (x: number, y: number, value: boolean) => {
      const {
        cellWidth: w, cellHeight: h, side
      } = infoRef.current;
      switch (props.canvasContext) {

        case Context.TwoD: {
          const canvas = canvasRef.current;
          const context = context2dRef.current;
          if ( isNil(canvas) || isNil(context) ) return;

          context.clearRect(w*x,h*y,w,h);
          context.beginPath();
          context.fillStyle =
            getComputedStyle(canvas)
            .getPropertyValue(`--${value?"on":"off"}-color`);
          context.fillRect(w*x,h*y,w,h);
        } break;

        case Context.Bitmap: {
          const context = contextBitmapRef.current;
          if ( isNil(context) ) return;
          const array = arrayRef.current;

          const color = value ? onColor : offColor;
          for (let i=0;i<h;i++) for (let j=0;j<w;j++) {
            const offsetX = x*w + j;
            const offsetY = y*h + i;
            const offset = ( offsetX + offsetY * (side*w) ) * 4;

            for (let ch=0;ch<4;ch++) array[ch+offset] = color[ch];
          }
        } break;

      }
    },
    []
  );

  // applying image
  const apply = useCallback(
    async () => {
      const context = contextBitmapRef.current;
      if (isNil(context)) return;

      const array = arrayRef.current;
      const { cellWidth: w, cellHeight: h, side } = infoRef.current;

      const imageData = new ImageData(array, side*w, side*h);
      const bitmap = await createImageBitmap(imageData);
      context.transferFromImageBitmap(bitmap);
    },
    []
  );

  // resize receiver
  useEffect(
    () => {
      const canvas = canvasRef.current;
      if (isNil(canvas)) return;

      const bcr = canvas.getBoundingClientRect();
      const dpr = props.adaptDevicePixelRatio ? window.devicePixelRatio : 1;

      const ratio = props.side > 0 ? dpr / props.side : 0;
      const width = Math.ceil( ratio * bcr.width );
      const height = Math.ceil( ratio * bcr.height );

      canvas.width = width * props.side;
      canvas.height = height * props.side;

      infoRef.current = {
        cellWidth: width, cellHeight: height,
        side: props.side
      };

      // calculate expecting array size
      const arraySize = (() => {
        switch (props.canvasContext) {
          case Context.Bitmap:
            return (props.side**2) * width * height * 4;
          case Context.TwoD:
            return 0;
        }
      })();

      // if the current array size is not the expected, recreate the array
      if ( arrayRef.current.length !== arraySize ) {
        arrayRef.current = Uint8ClampedArray.from({ length: arraySize });
      }

      // render bits only if bit state is not changed at all
      if (previousBits.current === props.bits) {
        for (let x=0;x<props.side;x++) for (let y=0;y<props.side;y++)
          drawBit(x,y,props.bits[x+y*props.side]);
        apply();
      }

    },
    [
      canvasRef.current,
      props.side,
      props.windowSize,
      props.adaptDevicePixelRatio
    ]
  );

  // state change receiver
  useEffect(() => {
    // safe guard
    if ( props.side**2 !== props.bits.length ) return;

    // Called only when the size is not changed
    // the side changing is handled later
    if ( props.bits.length === previousBits.current.length ) {
      props.bits.forEach((value, idx) => {
        const prevValue = previousBits.current[idx];
        if (value !== prevValue) return;

        const { x, y } = indexToXY(idx, props.side);
        drawBit(x,y,value);
      });
    }

    else {
      for (let x=0;x<props.side;x++) for (let y=0;y<props.side;y++)
        drawBit(x,y,props.bits[x+y*props.side]);
    }

    previousBits.current = props.bits;

    apply();
  }, [props.bits]);

  return <canvas className="view" ref={canvasRef} />;
};

// wrapper components to switch contexts safely
const WrapperView: RendererFC = (props) => {
  switch (props.canvasContext) {
    case Context.TwoD: return <Wrapper2DView {...props} />;
    case Context.Bitmap: return <WrapperBitmapView {...props} />;
  }
};
const Wrapper2DView: RendererFC = (props) => <View {...props} />;
const WrapperBitmapView: RendererFC = (props) => <View {...props} />;

export const renderer: Renderer = {
  name: "Canvas",
  isActive:
    Boolean(window.CanvasRenderingContext2D) &&
    Boolean(window.ImageBitmapRenderingContext),
  view: WrapperView,
  menu: Menu
};