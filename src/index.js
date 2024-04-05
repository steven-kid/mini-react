const Didact = {
  createElement,
  render
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type);

  const isProperty = key => key !== "children";
  Object.keys(fiber.props).filter(isProperty).forEach(name => {
    dom[name] = fiber.props[name];
  })

  fiber.props.children.forEach((child) => {
    render(child, dom);
  })

  return dom;
}

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    }
  }
}



let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYeild = false;

  while (nextUnitOfWork && !shouldYeild) {
    nextUnitOfWork = performUnitWork(
      nextUnitOfWork
    );
    shouldYeild = deadline.timeRemaining < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitWork(fiber) {
  // add new dom node
  if(!fiber.dom){
    fiber.dom = createDom(fiber);
  }

  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // create new fibers
  const elements = fiber.props.children
  let index = 0;

  let prevSibling = null;

  while(index < elements.length){
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiber
    }else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index ++ 
  }

  // return new unit of work
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
};

/** @jsx Didact.createElement */
const element = (
  <div style="background: salmon">
    <h1>Hello World</h1>
    <h2 style="text-align:right">from Didact</h2>
  </div>
);
const container = document.getElementById("root");
Didact.render(element, container);
