export class Token {
    constructor(
      public tokenId: string,
      public amount: number,
      public decimals: number,
      public name: string,
      public tokenType: string
    ) {}
  }