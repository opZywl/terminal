function generateToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export interface RAEntry {
    nome: string;
    RA: string;
    PASS: string;
    note?: string;
    token: string;
}

export const RAData: RAEntry[] = [
    { nome: "BRUNO DE OLIVEIRA FRANCISCO", RA: "183152", PASS: "11021997", token: generateToken() },
    { nome: "CLAUDIO LUIZ MARTINS JUNIOR", RA: "183809", PASS: "03061995", token: generateToken() },
    { nome: "DIEGO SOUZA FAGUNDES", RA: "061857", PASS: "02022006", note: "GRADISTA!", token: generateToken() },
    { nome: "EDUARDO ALEXANDRE POZZOBOM", RA: "183178", PASS: "05062004", note: "notas boas", token: generateToken() },
    { nome: "ELTHON DOS SANTOS MIGOTTO", RA: "193046", PASS: "02022004", token: generateToken() },
    { nome: "FELIPE JOSÉ SANTOS NORONHA", RA: "187780", PASS: "31102004", note: "notas boas", token: generateToken() },
    { nome: "GABRIEL PINHEIRO ARAÚJO", RA: "191346", PASS: "14092004", token: generateToken() },
    { nome: "GABRIELLY KATLYN CÓLIMO DE OLIVEIRA", RA: "185171", PASS: "10042002", note: "notas boas", token: generateToken() },
    { nome: "GUILHERME DE ALMEIDA SANTOS", RA: "179706", PASS: "24042000", token: generateToken() },
    { nome: "GUILHERME GOMES ROSA", RA: "180104", PASS: "17052004", token: generateToken() },
    { nome: "GUSTAVO BALTAZAR", RA: "182061", PASS: "20092003", note: "entrega as coisas", token: generateToken() },
    { nome: "GUSTAVO DINIZ BEZERRA", RA: "180092", PASS: "20022004", token: generateToken() },
    { nome: "JABES CANDIDO DA SILVA", RA: "180740", PASS: "14062004", token: generateToken() },
    { nome: "JOÃO HENRIQUE MORENO DE OLIVEIRA", RA: "180665", PASS: "27112003", token: generateToken() },
    { nome: "LUCAS CARDOSO RIOS", RA: "185793", PASS: "25062003", note: "entra as coisas", token: generateToken() },
    { nome: "LUIZA SANTOS PEINADO", RA: "185033", PASS: "20082004", note: "notas boas/entrega as coisas", token: generateToken() },
    { nome: "MATEUS DELUCAS THEOBALD", RA: "190379", PASS: "17062004", token: generateToken() },
    { nome: "MATHEUS SIQUEIRA SORDI", RA: "182483", PASS: "18072004", note: "entrega as coisas", token: generateToken() },
    { nome: "THIAGO PEREIRA DOS REIS BARREIRA", RA: "183344", PASS: "16102003", token: generateToken() },
    { nome: "VICTOR AUGUSTO GUEDES MOREIRA", RA: "057083", PASS: "25072003", token: generateToken() },
    { nome: "VINÍCIUS DOS SANTOS MARQUES DE CARVALHO", RA: "184145", PASS: "04022004", note: "entrega as coisas", token: generateToken() },
    { nome: "VINÍCIUS FERRETTI DE ALMEIDA", RA: "056176", PASS: "30101999", note: "ENTREGA AS COISAS", token: generateToken() },
    { nome: "VINICIUS JOAQUIM PONTES NASCIMENTO", RA: "181168", PASS: "11072003", token: generateToken() },
    { nome: "VINICIUS VANDERLEI SANTANA", RA: "180244", PASS: "11122003", note: "muito bom/entrega as coisas", token: generateToken() },
];