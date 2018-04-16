const NNa_SIGMOID = 1;
const NNa_TAHN    = 2;

class NNa {
    static get(NNaId) {
        switch (NNaId) {
            case NNa_SIGMOID : return NNa_Sigmoid;
            case NNa_TAHN    : return NNa_tanh;
        }
    }
}

let NNa_Sigmoid = (x, nd) => (nd) ? 1 / (1 + Math.exp(-x)) : x * (1 - x);
let NNa_tanh = (x, nd) => (nd) ? Math.tanh(x) : 1 - (x * x);
