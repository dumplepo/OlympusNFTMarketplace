import axios from 'axios';

const key = "e4b47f7a45965efc2def";
const secret = "e8daf82a90bfa39d751ad2e88bf7e1a8d12560883af983a3fc91abfdd2e505e5";

export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', file);

    const response = await axios.post(url, data, {
        headers: {
            'pinata_api_key': key,
            'pinata_secret_api_key': secret,
            'Content-Type': `multipart/form-data`,
        }
    });
    // MetaMask requires ipfs:// prefix to find the image
    return `ipfs://${response.data.IpfsHash}`;
};

export const uploadJSONToIPFS = async (metadata) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const response = await axios.post(url, metadata, {
        headers: {
            pinata_api_key: key,
            pinata_secret_api_key: secret,
            'Content-Type': 'application/json',
        }
    });
    // This URI is what you give to the smart contract
    return `ipfs://${response.data.IpfsHash}`;
};