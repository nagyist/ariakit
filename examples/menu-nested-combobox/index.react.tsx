import { Fragment, startTransition, useMemo, useState } from "react";
import type { Action } from "./actions.ts";
import { actions, defaultValues } from "./actions.ts";
import { Menu, MenuGroup, MenuItem, MenuSeparator } from "./menu.tsx";
import { filterActions } from "./utils.ts";

import "./style.css";

function renderItems(items: Action[], group?: string) {
  return items.map((item, index) => {
    const value = item.value || item.label;
    const separator = !!items[index - 1]?.items || (item.items && index > 0);

    const element = item.items ? (
      <MenuGroup label={item.label}>
        {renderItems(item.items, item.label)}
      </MenuGroup>
    ) : (
      <MenuItem name={group} value={value}>
        {item.label}
      </MenuItem>
    );

    return (
      <Fragment key={value}>
        {separator && <MenuSeparator />}
        {element}
      </Fragment>
    );
  });
}

function renderMatches(matches: Action[] | null) {
  if (!matches) return null;
  if (!matches.length) {
    return <div className="no-results">No results</div>;
  }
  return renderItems(matches);
}

export default function Example() {
  const [values, setValues] = useState(defaultValues);
  const [searchValue, setSearchValue] = useState("");
  const [pageSearchValue, setPageSearchValue] = useState("");

  const matches = useMemo(
    () => filterActions(Object.values(actions), searchValue),
    [searchValue],
  );
  const pageMatches = useMemo(
    () => filterActions(actions.turnIntoPageIn.items, pageSearchValue),
    [pageSearchValue],
  );

  const defaultItems = (
    <>
      <MenuItem>{actions.askAi.label}</MenuItem>
      <MenuItem>{actions.delete.label}</MenuItem>
      <MenuItem>{actions.duplicate.label}</MenuItem>
      <Menu label={actions.turnInto.label}>
        {renderItems(actions.turnInto.items, actions.turnInto.label)}
      </Menu>
      <Menu
        label={actions.turnIntoPageIn.label}
        onSearch={(value) => startTransition(() => setPageSearchValue(value))}
        combobox={<input placeholder="Search pages to add in..." />}
      >
        {renderMatches(pageMatches) ||
          renderItems(
            actions.turnIntoPageIn.items,
            actions.turnIntoPageIn.label,
          )}
      </Menu>
      <MenuSeparator />
      <MenuItem>{actions.copyLinkToBlock.label}</MenuItem>
      <MenuSeparator />
      <MenuItem>{actions.moveTo.label}</MenuItem>
      <MenuSeparator />
      <MenuItem>{actions.comment.label}</MenuItem>
      <MenuSeparator />
      <Menu label={actions.color.label}>
        {renderItems(actions.color.items, actions.color.label)}
      </Menu>
    </>
  );

  const trigger = (
    <button className="menu-button secondary" aria-label="Actions">
      <svg viewBox="0 0 15 15" fill="currentColor" width={20} height={20}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
        />
      </svg>
    </button>
  );

  return (
    <div className="wrapper">
      <Menu
        values={values}
        onValuesChange={(values: typeof defaultValues) => setValues(values)}
        onSearch={(value) => startTransition(() => setSearchValue(value))}
        combobox={<input placeholder="Search actions..." />}
        trigger={trigger}
      >
        {renderMatches(matches) || defaultItems}
      </Menu>
      <div style={{ color: values.Color, backgroundColor: values.Background }}>
        {values["Turn into"]}
      </div>
    </div>
  );
}
