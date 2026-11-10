-- ============================================================================
-- DADOS FICTÍCIOS PARA TESTE (nomes, CPFs, placas e telefones inventados)
-- CPFs/CNPJs têm dígito verificador válido só para passar na validação do app.
-- Admin:          87c991a3-5700-4ffd-9e10-d0f0b91c1807 (Robson Santos)
-- Corretor Teste: 6f9ce6b0-8213-4537-aacd-79d9eadf32b9
-- ============================================================================

-- Seguradoras ---------------------------------------------------------------
insert into public.insurers (name, cnpj, phone, email, website, commercial_contact, is_active, observations) values
 ('Aurora Seguros',        '11222333000181', '1130001000', 'comercial@aurora.exemplo.com.br',   'https://aurora.exemplo.com.br',   'Renata (comercial)',  true,  'Fictícia - teste'),
 ('Horizonte Seguradora',  '22333444000172', '1130002000', 'parcerias@horizonte.exemplo.com.br','https://horizonte.exemplo.com.br','Marcos (parcerias)',  true,  'Fictícia - teste'),
 ('Escudo Auto Seguros',   '33444555000163', '1130003000', 'corretor@escudo.exemplo.com.br',    'https://escudo.exemplo.com.br',   'Paula (atendimento)', true,  'Fictícia - teste'),
 ('Rota Segura',           '44555666000154', '1130004000', 'vendas@rotasegura.exemplo.com.br',  'https://rotasegura.exemplo.com.br','Tiago (vendas)',     true,  'Fictícia - teste'),
 ('Ponte Seguros (inativa)','55666777000145','1130005000', 'contato@ponte.exemplo.com.br',      null,                              null,                  false, 'Fictícia - inativa para testar o filtro');

-- Clientes ------------------------------------------------------------------
insert into public.clients (full_name, cpf_cnpj, birth_date, phone, whatsapp, email, cep, address, number, neighborhood, city, state, corretor_id, observations) values
 ('Mariana Costa Ribeiro',       '84894655764', '1988-03-14', '11987650101', '11987650101', 'mariana.ribeiro@exemplo.com.br', '01310100', 'Av. Paulista',            '1000', 'Bela Vista',    'São Paulo',      'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício'),
 ('Carlos Eduardo Nunes',        '55283220060', '1975-11-02', '19987650102', '19987650102', 'carlos.nunes@exemplo.com.br',    '13010000', 'Rua Barão de Jaguara',    '455',  'Centro',        'Campinas',       'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício'),
 ('Fernanda Lima Rocha',         '58459949001', '1992-07-21', '11987650103', '11987650103', 'fernanda.rocha@exemplo.com.br',  '04538132', 'Rua Funchal',             '200',  'Vila Olímpia',  'São Paulo',      'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício'),
 ('João Pedro Almeida',          '02428138600', '2000-01-30', '11987650104', '11987650104', 'joao.almeida@exemplo.com.br',    '09010000', 'Rua Senador Flaquer',     '78',   'Centro',        'Santo André',    'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício - motociclista'),
 ('Patrícia Gomes Duarte',       '82750213401', '1983-09-09', '21987650105', '21987650105', 'patricia.duarte@exemplo.com.br', '22041001', 'Rua Barata Ribeiro',      '310',  'Copacabana',    'Rio de Janeiro', 'RJ', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício'),
 ('Ricardo Moreira Lopes',       '45958255606', '1969-05-17', '31987650106', '31987650106', 'ricardo.lopes@exemplo.com.br',   '30130010', 'Av. Afonso Pena',         '1500', 'Centro',        'Belo Horizonte', 'MG', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício'),
 ('Transportes Vale Verde Ltda', '93894514000119', null,        '1130506070',  '11987650111', 'frota@valeverde.exemplo.com.br', '06454000', 'Al. Rio Negro',           '500',  'Alphaville',    'Barueri',        'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício - frota (CNPJ)'),
 ('Juliana Freitas Barros',      '52595454358', '1995-12-05', '11987650107', '11987650107', 'juliana.barros@exemplo.com.br',  '02011000', 'Rua Voluntários da Pátria','900', 'Santana',       'São Paulo',      'SP', '6f9ce6b0-8213-4537-aacd-79d9eadf32b9', 'Fictício - carteira do Corretor Teste'),
 ('André Luiz Carvalho',         '32614563706', '1980-04-22', '11987650108', '11987650108', 'andre.carvalho@exemplo.com.br',  '03310000', 'Rua Tuiuti',              '120',  'Tatuapé',       'São Paulo',      'SP', '6f9ce6b0-8213-4537-aacd-79d9eadf32b9', 'Fictício - carteira do Corretor Teste'),
 ('Beatriz Santana Melo',        '29724559327', '1998-08-11', '41987650109', '41987650109', 'beatriz.melo@exemplo.com.br',    '80010000', 'Rua XV de Novembro',      '700',  'Centro',        'Curitiba',       'PR', '6f9ce6b0-8213-4537-aacd-79d9eadf32b9', 'Fictício - carteira do Corretor Teste'),
 ('Gustavo Henrique Prado',      '15316247582', '1990-02-27', '11987650110', '11987650110', 'gustavo.prado@exemplo.com.br',   '05402000', 'Rua Cardeal Arcoverde',   '1800', 'Pinheiros',     'São Paulo',      'SP', '6f9ce6b0-8213-4537-aacd-79d9eadf32b9', 'Fictício - carteira do Corretor Teste'),
 ('Padaria Bom Grão ME',         '99163769000198', null,        '1130708090',  '11987650112', 'contato@bomgrao.exemplo.com.br', '04101000', 'Rua Vergueiro',           '3200', 'Vila Mariana',  'São Paulo',      'SP', '6f9ce6b0-8213-4537-aacd-79d9eadf32b9', 'Fictício - empresa (CNPJ)'),
 ('Lucas Martins Teixeira',      '09720587024', '2001-06-15', '11987650113', '11987650113', 'lucas.teixeira@exemplo.com.br',  '08010000', 'Rua Itaquera',            '45',   'Itaquera',      'São Paulo',      'SP', '87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'Fictício - sem veículo (testar exclusão)');

-- Veículos ------------------------------------------------------------------
insert into public.vehicles (client_id, type, brand, model, year_manufacture, year_model, plate, renavam, chassis, color, fuel, mileage, fipe_code, fipe_value, declared_value, usage, sleep_cep, observations)
select c.id, v.type, v.brand, v.model, v.yf, v.ym, v.plate, v.renavam, v.chassis, v.color, v.fuel, v.km, v.fipe_code, v.fipe, v.declared, v.usage, v.cep, 'Fictício'
from (values
 ('84894655764',    'car',        'Toyota',     'Corolla XEi 2.0',     2022, 2023, 'FTX1A23', '01234567801', '9BRBL3HE0P0100001', 'Prata',    'Flex',     '28000', '002210-1', '135000.00', '135000.00', 'Particular', '01310100'),
 ('55283220060',    'car',        'Volkswagen', 'T-Cross Highline',    2021, 2022, 'CDN2B34', '01234567802', '9BWBH6BF0N0100002', 'Branco',   'Flex',     '41000', '005480-3', '128500.00', '128500.00', 'Particular', '13010000'),
 ('55283220060',    'car',        'Fiat',       'Strada Volcano',      2023, 2024, 'CDN3C45', '01234567803', '9BD281A3RP0100003', 'Vermelho', 'Flex',     '12000', '001500-7', '118900.00', '118900.00', 'Trabalho',   '13010000'),
 ('58459949001',    'car',        'Hyundai',    'HB20 Platinum',       2023, 2023, 'FLR4D56', '01234567804', '9BHBG51CAPP100004', 'Azul',     'Flex',     '9000',  '015090-2', '98700.00',  '98700.00',  'Particular', '04538132'),
 ('02428138600',    'motorcycle', 'Honda',      'CG 160 Titan',        2022, 2022, 'JPA5E67', '01234567805', '9C2KC2210NR100005', 'Preta',    'Flex',     '22000', '811157-0', '16800.00',  '16800.00',  'Particular', '09010000'),
 ('02428138600',    'motorcycle', 'Yamaha',     'Fazer FZ25',          2023, 2024, 'JPA6F78', '01234567806', '9C6RG3820R0100006', 'Azul',     'Gasolina', '6000',  '827041-4', '22900.00',  '22900.00',  'Particular', '09010000'),
 ('82750213401',    'car',        'Jeep',       'Compass Longitude',   2022, 2022, 'RIO7G89', '01234567807', '988675145NK100007', 'Cinza',    'Flex',     '35000', '025180-0', '156000.00', '160000.00', 'Particular', '22041001'),
 ('45958255606',    'car',        'Chevrolet',  'Onix Plus Premier',   2021, 2021, 'BHZ8H90', '01234567808', '9BGEP69H0MB100008', 'Branco',   'Flex',     '52000', '004467-4', '89500.00',  '89500.00',  'Aplicativo','30130010'),
 ('93894514000119', 'car',        'Fiat',       'Fiorino Endurance',   2022, 2023, 'VVD1J01', '01234567809', '9BD265523P0100009', 'Branco',   'Flex',     '67000', '001506-6', '99800.00',  '99800.00',  'Comercial',  '06454000'),
 ('93894514000119', 'car',        'Renault',    'Master Furgão',       2021, 2022, 'VVD2K12', '01234567810', '93YMAF4XEN0100010', 'Branco',   'Diesel',   '98000', '025260-2', '210000.00', '210000.00', 'Comercial',  '06454000'),
 ('52595454358',    'car',        'Renault',    'Kwid Zen',            2022, 2023, 'JUL3L23', '01234567811', '93YRBB00XPJ100011', 'Laranja',  'Flex',     '18000', '025275-0', '62300.00',  '62300.00',  'Particular', '02011000'),
 ('32614563706',    'car',        'Toyota',     'Hilux SRV 2.8',       2020, 2021, 'AND4M34', '01234567812', '8AJBA3CD0M0100012', 'Preto',    'Diesel',   '88000', '002235-7', '215000.00', '215000.00', 'Particular', '03310000'),
 ('29724559327',    'motorcycle', 'Honda',      'Biz 125',             2023, 2023, 'BEA5N45', '01234567813', '9C2JC7500PR100013', 'Branca',   'Flex',     '4000',  '811162-6', '15900.00',  '15900.00',  'Particular', '80010000'),
 ('15316247582',    'car',        'Volkswagen', 'Nivus Comfortline',   2023, 2024, 'GUS6P56', '01234567814', '9BWDH6BF0R0100014', 'Cinza',    'Flex',     '11000', '005515-0', '119000.00', '119000.00', 'Particular', '05402000'),
 ('99163769000198', 'motorcycle', 'Honda',      'Pop 110i (entregas)', 2022, 2022, 'PAD7Q67', '01234567815', '9C2JB0100NR100015', 'Vermelha', 'Gasolina', '31000', '811158-9', '9800.00',   '9800.00',   'Comercial',  '04101000')
) as v(doc, type, brand, model, yf, ym, plate, renavam, chassis, color, fuel, km, fipe_code, fipe, declared, usage, cep)
join public.clients c on c.cpf_cnpj = v.doc;

-- Cotações (todos os status) ---------------------------------------------------
insert into public.quotes (client_id, vehicle_id, insurer_id, quote_date, premium_value, franchise_value, payment_method, installments, coverage, third_party_coverage, assistance_24h, replacement_car, theft_protection, status, observations)
select ve.client_id, ve.id, i.id, q.dt::date, q.premio, q.franquia, q.pgto, q.parc, q.cob, q.terc, q.a24, q.reserva, q.roubo, q.status, 'Fictícia'
from (values
 ('FTX1A23', 'Aurora Seguros',       '2026-11-08', '4890.00', '6750.00', 'Cartão de crédito', 10, 'Compreensiva', true,  true,  true,  true,  'Nova cotação'),
 ('FTX1A23', 'Horizonte Seguradora', '2026-11-08', '5120.00', '5400.00', 'Cartão de crédito', 10, 'Compreensiva', true,  true,  true,  true,  'Nova cotação'),
 ('CDN2B34', 'Escudo Auto Seguros',  '2026-11-03', '4350.00', '6425.00', 'Boleto',            4,  'Compreensiva', true,  true,  false, true,  'Em análise'),
 ('FLR4D56', 'Rota Segura',          '2026-10-29', '3180.00', '4935.00', 'Débito em conta',   6,  'Compreensiva', true,  true,  true,  true,  'Aguardando cliente'),
 ('JPA6F78', 'Aurora Seguros',       '2026-10-27', '1690.00', '2290.00', 'Pix',               1,  'Roubo e furto', false, true, false, true,  'Aguardando cliente'),
 ('RIO7G89', 'Horizonte Seguradora', '2026-10-20', '6240.00', '7800.00', 'Cartão de crédito', 12, 'Compreensiva', true,  true,  true,  true,  'Aprovada'),
 ('BHZ8H90', 'Escudo Auto Seguros',  '2026-10-15', '3970.00', '4475.00', 'Boleto',            5,  'Compreensiva + APP', true, true, true, true, 'Recusada'),
 ('JUL3L23', 'Rota Segura',          '2026-11-05', '2380.00', '3115.00', 'Cartão de crédito', 10, 'Compreensiva', true,  true,  false, true,  'Em análise'),
 ('AND4M34', 'Aurora Seguros',       '2026-11-01', '7350.00', '10750.00','Cartão de crédito', 12, 'Compreensiva', true,  true,  true,  true,  'Nova cotação'),
 ('BEA5N45', 'Escudo Auto Seguros',  '2026-10-25', '1290.00', '1590.00', 'Pix',               1,  'Roubo e furto', false, true, false, true,  'Recusada'),
 ('GUS6P56', 'Horizonte Seguradora', '2026-11-09', '4410.00', '5950.00', 'Débito em conta',   8,  'Compreensiva', true,  true,  true,  true,  'Aprovada'),
 ('PAD7Q67', 'Rota Segura',          '2026-10-30', '980.00',  '980.00',  'Boleto',            3,  'Terceiros',    true,  true,  false, false, 'Aguardando cliente'),
 ('CDN3C45', 'Aurora Seguros',       '2026-09-12', '4020.00', '5945.00', 'Cartão de crédito', 10, 'Compreensiva', true,  true,  true,  true,  'Convertida em apólice'),
 ('VVD2K12', 'Horizonte Seguradora', '2026-08-18', '8900.00', '10500.00','Boleto',            6,  'Compreensiva frota', true, true, true, true, 'Convertida em apólice')
) as q(plate, seg, dt, premio, franquia, pgto, parc, cob, terc, a24, reserva, roubo, status)
join public.vehicles ve on ve.plate = q.plate
join public.insurers i on i.name = q.seg;

-- Apólices (vencimentos para cada filtro de Renovações) -----------------------
insert into public.policies (policy_number, client_id, vehicle_id, insurer_id, corretor_id, contract_date, start_date, end_date, premium_value, franchise_value, commission_percent, commission_value, payment_method, installments, status, observations)
select p.num, ve.client_id, ve.id, i.id, c.corretor_id, p.contrato::date, p.inicio::date, p.fim::date, p.premio, p.franquia, p.perc,
       to_char(round(p.premio::numeric * p.perc::numeric / 100, 2), 'FM999999990.00'), p.pgto, p.parc, p.status, p.obs
from (values
 ('AUR-2025-000101', 'CDN3C45', 'Aurora Seguros',       '2025-10-15', '2025-10-20', '2026-10-20', '3850.00', '5945.00',  '15.00', 'Cartão de crédito', 10, 'Vencida',      'Fictícia - VENCIDA'),
 ('HOR-2025-000102', 'FTX1A23', 'Horizonte Seguradora', '2025-11-10', '2025-11-14', '2026-11-14', '4650.00', '6750.00',  '18.00', 'Cartão de crédito', 10, 'Em renovação', 'Fictícia - vence em 4 dias'),
 ('ESC-2025-000103', 'FLR4D56', 'Escudo Auto Seguros',  '2025-11-18', '2025-11-22', '2026-11-22', '3020.00', '4935.00',  '15.00', 'Débito em conta',   6,  'Ativa',        'Fictícia - vence em 12 dias'),
 ('ROT-2025-000104', 'JPA5E67', 'Rota Segura',          '2025-11-30', '2025-12-05', '2026-12-05', '1180.00', '1680.00',  '20.00', 'Pix',               1,  'Ativa',        'Fictícia - vence em 25 dias'),
 ('AUR-2025-000105', 'RIO7G89', 'Aurora Seguros',       '2025-12-15', '2025-12-20', '2026-12-20', '5980.00', '7800.00',  '15.00', 'Cartão de crédito', 12, 'Ativa',        'Fictícia - vence em 40 dias'),
 ('HOR-2026-000106', 'BHZ8H90', 'Horizonte Seguradora', '2026-01-02', '2026-01-05', '2027-01-05', '3740.00', '4475.00',  '17.00', 'Boleto',            5,  'Ativa',        'Fictícia - vence em 56 dias'),
 ('HOR-2026-000107', 'VVD2K12', 'Horizonte Seguradora', '2026-08-20', '2026-08-25', '2027-08-25', '8900.00', '10500.00', '12.00', 'Boleto',            6,  'Ativa',        'Fictícia - frota'),
 ('ESC-2026-000108', 'VVD1J01', 'Escudo Auto Seguros',  '2026-03-10', '2026-03-15', '2027-03-15', '4280.00', '4990.00',  '12.00', 'Boleto',            4,  'Ativa',        'Fictícia - frota'),
 ('ROT-2026-000109', 'JUL3L23', 'Rota Segura',          '2025-11-20', '2025-11-25', '2026-11-25', '2250.00', '3115.00',  '18.00', 'Cartão de crédito', 10, 'Ativa',        'Fictícia - Corretor Teste, vence em 15 dias'),
 ('AUR-2026-000110', 'AND4M34', 'Aurora Seguros',       '2026-11-04', '2026-11-05', '2027-11-05', '7120.00', '10750.00', '15.00', 'Cartão de crédito', 12, 'Ativa',        'Fictícia - Corretor Teste, venda deste mês'),
 ('ESC-2026-000111', 'BEA5N45', 'Escudo Auto Seguros',  '2026-02-01', '2026-02-03', '2027-02-03', '1240.00', '1590.00',  '20.00', 'Pix',               1,  'Cancelada',    'Fictícia - Corretor Teste, cancelada'),
 ('HOR-2026-000112', 'GUS6P56', 'Horizonte Seguradora', '2026-11-09', '2026-11-10', '2027-11-10', '4410.00', '5950.00',  '16.00', 'Débito em conta',   8,  'Ativa',        'Fictícia - Corretor Teste, venda deste mês'),
 ('ROT-2026-000113', 'PAD7Q67', 'Rota Segura',          '2026-06-01', '2026-06-03', '2027-06-03', '980.00',  '980.00',   '20.00', 'Boleto',            3,  'Ativa',        'Fictícia - Corretor Teste, moto de entregas')
) as p(num, plate, seg, contrato, inicio, fim, premio, franquia, perc, pgto, parc, status, obs)
join public.vehicles ve on ve.plate = p.plate
join public.clients c on c.id = ve.client_id
join public.insurers i on i.name = p.seg;

-- Comissões (recebidas e pendentes) ---------------------------------------------
insert into public.commissions (policy_id, percent, value, expected_date, received_date, status)
select p.id, p.commission_percent, p.commission_value,
       p.contract_date + 30,
       case when p.contract_date + 30 < date '2026-11-10' and p.status <> 'Cancelada' then p.contract_date + 32 end,
       case when p.status = 'Cancelada' then 'Cancelado'
            when p.contract_date + 30 < date '2026-11-10' then 'Recebido'
            else 'Pendente' end
from public.policies p
where p.policy_number like '___-202_-0001__';

-- Renovação em andamento + contatos -------------------------------------------
insert into public.renewals (policy_id, old_policy_id, client_id, vehicle_id, insurer_id, corretor_id, old_premium_value, new_premium_value, renewed, renewal_date, observations)
select p.id, p.id, p.client_id, p.vehicle_id, p.insurer_id, p.corretor_id, p.premium_value, '5120.00', false, date '2026-11-08', 'Fictícia - cliente comparando com outra seguradora'
from public.policies p where p.policy_number = 'HOR-2025-000102';

insert into public.renewal_contacts (renewal_id, contact_date, contact_type, observations)
select r.id, x.dt::date, x.tipo, x.obs
from public.renewals r
join public.policies p on p.id = r.policy_id and p.policy_number = 'HOR-2025-000102'
cross join (values
 ('2026-11-03', 'WhatsApp', 'Enviado aviso de vencimento e pedido de documentos.'),
 ('2026-11-08', 'Telefone', 'Cliente pediu cotação em outra seguradora para comparar.')
) as x(dt, tipo, obs);

-- Auditoria (para a tela de Auditoria ter conteúdo) ----------------------------
insert into public.audit_logs (user_id, action, table_name, new_values) values
 ('87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'seed_dados_ficticios', 'clients',  '{"origem":"seed_ficticio.sql"}'),
 ('87c991a3-5700-4ffd-9e10-d0f0b91c1807', 'seed_dados_ficticios', 'policies', '{"origem":"seed_ficticio.sql"}');
