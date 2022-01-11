import { useState } from 'react';
import './App.css';
import Papa from 'papaparse';

const VAT_INVOICE = 'VAT Invoice #';
const ASIN = 'ASIN';
const CARRIER_TRACKING = 'Carrier Tracking #';
const ITEM_NET_TOTAL = 'Item Net Total';

function App() {
  const [csvFile, setCSVFile] = useState(undefined);
  const [fileType, setFileType] = useState(true);

  const downloadCSV = (csvFile, name) => {
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", csvFile]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const removeDuplicate = (data) => {
    data.sort((a, b) => {
      if (fileType) {
        if (a[VAT_INVOICE] !== b[VAT_INVOICE]) {
          return a[VAT_INVOICE] < b[VAT_INVOICE] ? -1 : 1;
        }
        return a[ASIN] < b[ASIN] ? -1 : 1;
      } else {
        if (a[CARRIER_TRACKING] !== b[CARRIER_TRACKING]) {
          return a[CARRIER_TRACKING] < b[CARRIER_TRACKING] ? -1 : 1;
        }
        return a[ASIN] < b[ASIN] ? -1 : 1;
      }
    });
    if (fileType) {
      data = data.filter((item, pos, arr) => {
        if (pos == 0) {
          return true;
        }
        if (item[VAT_INVOICE] === arr[pos - 1][VAT_INVOICE] && item[ASIN] === arr[pos - 1][ASIN]) {
          return false;
        }
        return true;
      });
      const newCSV = Papa.unparse(data);
      downloadCSV(newCSV, 'order.csv');
    } else {
      data = data.reduce((res, item, pos) => {
        item[ITEM_NET_TOTAL] = parseFloat(item[ITEM_NET_TOTAL]);
        if (pos == 0) {
          return [item];
        }

        if (res[res.length - 1][CARRIER_TRACKING] === item[CARRIER_TRACKING]
          && res[res.length - 1][ASIN] === item[ASIN]) {
          res[res.length - 1][ITEM_NET_TOTAL] += item[ITEM_NET_TOTAL];
          return res;
        }
        res.push(item);
        return res;
      }, []);
      const newCSV = Papa.unparse(data);
      downloadCSV(newCSV, 'ship.csv');
    }
  }

  const handleChange = event => {
    if (event.target.name === 'file-type') {
      setFileType(event.target.value === 'order');
    } else {
      setCSVFile(event.target.files[0]);
    }
  };

  const importCSV = () => {
    Papa.parse(csvFile, {
      complete: (data) => {
        console.log('data', data);
        removeDuplicate(data.data);
      },
      header: true
    });
  };

  return (
    <div className="App">
      <h1>CSV Manager</h1>
      <select name="file-type" onChange={handleChange}>
        <option value='order' selected={fileType === true}>Order</option>
        <option value='ship' selected={fileType === false}>Ship</option>
      </select>
      <input
        className="csv-input"
        type="file"
        name="file"
        placeholder={null}
        onChange={handleChange}
      />
      <p />
      <button onClick={importCSV}> Upload now!</button>
    </div>
  );
}

export default App;
