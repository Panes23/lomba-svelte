alter table if exists public.websites 
add column if not exists color text;

-- Update existing websites dengan color default mereka
update websites set color = '#584dee' where nama = 'NERO4D';
update websites set color = '#ff1010' where nama = 'ARWANATOTO';
update websites set color = 'text-[#a2712a]' where nama = 'ZARA4D';
update websites set color = 'text-[#df2265]' where nama = 'DEWIGAMING';
update websites set color = 'text-[#c5c5c5]' where nama = 'ROMA4D';
update websites set color = 'text-[#ffffff]' where nama = 'JEEPTOTO';
update websites set color = 'text-[#b5d35a]' where nama = 'DOYANTOTO';
update websites set color = 'text-[#d4c468]' where nama = 'TSTOTO';
update websites set color = 'text-[#4d6d8e]' where nama = 'DIORGAMING';
update websites set color = 'text-[#ffde00]' where nama = 'NEON4D';
update websites set color = 'text-[#e4c658]' where nama = 'DUOGAMING';
update websites set color = 'text-[#d7e2ef]' where nama = 'ARTA4D'; 