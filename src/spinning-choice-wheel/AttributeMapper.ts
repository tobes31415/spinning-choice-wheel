import { logError, toKebabCase } from "./util";

interface WebComponentAttributeMapperProps {
  attributeName?: string;
  propertyName: string;
  target: HTMLElement;
  parse?: boolean | string | ((value: string) => any);
}

export class WebComponentAttributeMapper {
  #lastObservedValue: string | undefined;
  #parser: (value: string) => any;
  private attributeName: string;
  private propertyName: string;
  private target: HTMLElement;

  constructor(props: WebComponentAttributeMapperProps) {
    const parse = props.parse;
    this.attributeName = toKebabCase(props.attributeName || props.propertyName);
    this.propertyName = props.propertyName;
    this.target = props.target;

    if (parse === true) {
      this.#parser = (value: string) => JSON.parse(value);
    } else if (typeof parse === "function") {
      this.#parser = parse;
    } else if (parse === "function") {
      this.#parser = (value: string) => new Function(value);
    } else {
      this.#parser = (value: string) => value;
    }
  }

  check() {
    const currentValue =
      this.target.getAttribute(this.attributeName) || undefined;
    if (currentValue && currentValue !== this.#lastObservedValue) {
      this.#lastObservedValue = currentValue;
      logError(() => {
        const parsedValue = this.#parser(currentValue);
        (this.target as any)[this.propertyName] = parsedValue;
      }, `Failed to parse ${this.attributeName} => ${this.propertyName}`);
    }
  }
}

export class WebComponentAttributesMapper {
  private mappers: WebComponentAttributeMapper[];
  constructor(
    attributes: Omit<WebComponentAttributeMapperProps, "target">[],
    target: any
  ) {
    this.mappers = attributes.map(
      (attribute) => new WebComponentAttributeMapper({ ...attribute, target })
    );
  }
  check() {
    this.mappers.forEach((mapper) => mapper.check());
  }
}
