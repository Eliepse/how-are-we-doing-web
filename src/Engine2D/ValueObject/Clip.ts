enum ClipType {
  rect,
  xywh,
}

export class ClipPath {
  private constructor(
    private type: ClipType,
    private top: string,
    private right: string,
    private bottom: string,
    private left: string
  ) {}

  toString(): string {
    let prefix = "";

    switch (this.type) {
      case ClipType.rect:
        prefix = "rect";
        break;
      case ClipType.xywh:
        prefix = "xywh";
        break;
    }

    const body = [this.top, this.right, this.bottom, this.left].join(" ");
    return `${prefix}(${body})`;
  }

  toAttribute(): string {
    return `clip-path="${this.toString()}"`;
  }

  static rect(top: string, right: string, bottom: string, left: string): ClipPath {
    return new ClipPath(ClipType.rect, top, right, bottom, left);
  }

  static xywh(top: string, right: string, bottom: string, left: string): ClipPath {
    return new ClipPath(ClipType.xywh, top, right, bottom, left);
  }
}
