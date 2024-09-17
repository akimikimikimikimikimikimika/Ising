/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <table className="view">
    <StaticStyle />
    <Cells bits={props.bits} />
  </table>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    table.view {
      border-collapse: collapse;
      border: none;
    }
    td.on {
      background-color: var(--on-color);
    }
    td.off {
      background-color: var(--off-color);
    }
  `);

  return <style>{src}</style>;
});

type CellsProps = {
  bits: Bits;
};

const Cells: FC<CellsProps> = (props) => {
  const bitsNested = ArrayUtils.nested(props.bits);

  return <tbody>
    {bitsNested.map((bits,idx) => (
      <tr key={idx}>
        {bits.map((value,idx) => (
          <td key={idx} className={value ? "on" : "off"} />
        ))}
      </tr>
    ))}
  </tbody>;
};

export const renderer : RendererDefs.Renderer = {
  name: "Table",
  isActive: Boolean(window.HTMLTableCellElement),
  view: View
};