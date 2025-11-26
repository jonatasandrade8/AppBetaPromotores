(function() {
    'use strict';

    const PROMOTORES_DATA = {
        "Rio Grande do Norte": {
            "Miqueias": { 
                id: "RN1001", 
                redes: { "Assaí": ["Ponta Negra"] } 
            },
            "Jordão": { 
                id: "RN2001", 
                redes: { 
                    "Superfácil": ["Olho d'Água", "Emaús"], 
                    "Mar Vermelho": ["BR-101 Sul"] 
                } 
            },
            "Cosme": { 
                id: "RN1002", 
                redes: { "Assaí": ["Zona Norte"] } 
            },
            "David": { 
                id: "RN1003", 
                redes: { "Assaí": ["Zona Sul"] } 
            },
            "Erivan": { 
                id: "RN1004", 
                redes: { "Assaí": ["Maria Lacerda"] } 
            },
            "Inacio": { 
                id: "RN1005", 
                redes: { "Atacadão": ["Prudente"] } 
            },
            "Vivian": { 
                id: "RN1006", 
                redes: { "Atacadão": ["BR-101 Sul"] } 
            },
            "Amarildo": { 
                id: "RN1007", 
                redes: { 
                    "Atacadão": ["Zona Norte"], 
                    "Nordestão": ["Loja 05"] 
                } 
            },
            "Nilson": { 
                id: "RN1008", 
                redes: { "Atacadão": ["Parnamirim"] } 
            },
            "Markson": { 
                id: "RN1009", 
                redes: { 
                    "Nordestão": ["Loja 08"], 
                    "Mar Vermelho": ["Parnamirim"], 
                    "Atacadão": ["BR-101 Sul"] 
                } 
            },
            "Mateus": { 
                id: "RN1010", 
                redes: { 
                    "Nordestão": ["Loja 04"], 
                    "Carrefour": ["Zona Sul"] 
                } 
            },
            "Cristiane": { 
                id: "RN1011", 
                redes: { "Nordestão": ["Loja 07"] } 
            },
            "J Mauricio": { 
                id: "RN1012", 
                redes: { "Nordestão": ["Loja 03"] } 
            },
            "Neto": { 
                id: "RN1013", 
                redes: { "Superfácil": ["Emaús"] } 
            },
            "Antonio": { 
                id: "RN1014", 
                redes: { "Superfácil": ["Nazaré"] } 
            }
        },
        "Paraíba": {
            "João": { 
                id: "PB2001", 
                redes: { "RDAAAAA": ["MKBBB", "MKCCC"] } 
            }
        }
    };

    const PHOTO_TYPES = {
        "Bancadas": "Bancadas",
        "Ponto Extra": "Ponto Extra",
        "Caixas Secas": "Caixas Secas",
        "Ação de Degustação": "Ação de Degustação"
    };

    const RELATORIO_DATA = {
        MOTIVOS_DEVOLUCAO: [
            "Muito Madura",
            "Muito Arranhada",
            "Tamanho Fora do Padrão",
            "Atraso na Entrega",
            "Peso Alterado",
            "Encruada"
        ],
        TIPOS_PRODUTO: [
            "Prata",
            "Pacovan",
            "Comprida",
            "Leite",
            "Nanica",
            "Goiaba",
            "Abacaxi"
        ]
    };

    function getPromotorData(estado, promotorNome) {
        if (PROMOTORES_DATA[estado] && PROMOTORES_DATA[estado][promotorNome]) {
            return PROMOTORES_DATA[estado][promotorNome];
        }
        return null;
    }

    function getPromotorRedes(promotorNome) {
        for (const estado in PROMOTORES_DATA) {
            if (PROMOTORES_DATA[estado][promotorNome]) {
                return PROMOTORES_DATA[estado][promotorNome].redes;
            }
        }
        return null;
    }

    function getAllPromotores() {
        const promotores = [];
        for (const estado in PROMOTORES_DATA) {
            for (const nome in PROMOTORES_DATA[estado]) {
                promotores.push({
                    nome: nome,
                    estado: estado,
                    ...PROMOTORES_DATA[estado][nome]
                });
            }
        }
        return promotores;
    }

    function getEstados() {
        return Object.keys(PROMOTORES_DATA);
    }

    function getPromotoresByEstado(estado) {
        if (!PROMOTORES_DATA[estado]) return [];
        return Object.keys(PROMOTORES_DATA[estado]);
    }

    function getAppData() {
        const promotores = {};
        const allPromotores = getAllPromotores();
        allPromotores.forEach(p => {
            promotores[p.nome] = p.redes;
        });
        return promotores;
    }

    window.QdeliciaData = {
        PROMOTORES_DATA: PROMOTORES_DATA,
        PHOTO_TYPES: PHOTO_TYPES,
        RELATORIO_DATA: RELATORIO_DATA,
        getPromotorData: getPromotorData,
        getPromotorRedes: getPromotorRedes,
        getAllPromotores: getAllPromotores,
        getEstados: getEstados,
        getPromotoresByEstado: getPromotoresByEstado,
        getAppData: getAppData
    };

})();
