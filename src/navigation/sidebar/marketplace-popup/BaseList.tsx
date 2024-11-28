import { FunctionComponent } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

export const BaseList: FunctionComponent<{
  items;
  selectedItem;
  selectItem;
  EmptyPlaceholder;
  ItemComponent;
  linkState?;
}> = ({
  items,
  selectedItem,
  selectItem,
  EmptyPlaceholder,
  ItemComponent,
  linkState,
}) => {
  return (
    <div className="scrollbar">
      <ListGroup>
        {items.length === 0 ? (
          <ListGroupItem>
            <EmptyPlaceholder />
          </ListGroupItem>
        ) : (
          items.map((item) => (
            <ItemComponent
              key={item.uuid}
              item={item}
              selectedItem={selectedItem}
              onClick={selectItem}
              linkState={linkState}
            />
          ))
        )}
      </ListGroup>
    </div>
  );
};
