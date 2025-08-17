const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6mJOeRB16VUSSEG1Ytb1c6n2CHzOSNEayGMb-Bi02swppVMOSEAHX3Rzz6qu7u558/exec";

async function loadOrders(){
  try{
    const res = await fetch(SCRIPT_URL + '?action=getOrders');
    const data = await res.json();
    const tbody = document.getElementById('ordersBody');
    if(!Array.isArray(data)) throw new Error('Invalid response');
    tbody.innerHTML = data.map(o=>`<tr>
      <td>${o.name||''}</td>
      <td>${o.phone||''}</td>
      <td>${o.address||''}</td>
      <td>${o.payment||''}</td>
      <td style="white-space:pre-wrap">${o.items||''}</td>
      <td>${o.total||''}</td>
    </tr>`).join('');
  }catch(err){
    console.error(err);
    alert('❌ Failed to load orders. Check Apps Script doGet and sheet name.');
  }
}

document.getElementById('refreshOrders').addEventListener('click', loadOrders);
