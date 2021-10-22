let _ddragon: string | undefined;
export function ddragon() {
    if(_ddragon) return _ddragon;

    // Carrega ddragon async.
const req = new XMLHttpRequest();
req.onreadystatechange = () => {
    if(req.status !== 200 || !req.responseText || req.readyState !== 4) return;
    const versions: string[] = JSON.parse(req.responseText);
    _ddragon = versions[0]; // Mais novo em primeiro na lista
};
req.open("GET", "https://ddragon.valorant.com/api/versions.json", true);
req.send();

   // retorna default até ter carregado
   return "10.22.1";
}




