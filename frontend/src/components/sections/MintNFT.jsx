import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/pinata';

const categories = ['Gods', 'Titans', 'Heroes', 'Creatures', 'Artifacts'];

export default function MintNFT({ onMint, onButtonClick }) {
  const [isMinting, setIsMinting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gods');
  const [collection, setCollection] = useState('');
  const [newCollection, setNewCollection] = useState('');
  const [royalty, setRoyalty] = useState('10');
  const [useNewCollection, setUseNewCollection] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    const activeCollection = useNewCollection ? newCollection : collection;

    if (!name || !imageFile || !description || !activeCollection) {
      alert('The Gods require all fields to be filled before forging.');
      return;
    }

    onButtonClick(async () => {
      try {
        setIsMinting(true);

        // 1. Upload Image to Pinata
        const imageIpfsUri = await uploadFileToIPFS(imageFile);

        // 2. Prepare Metadata (MetaMask standards)
        const metadata = {
          name: name,
          description: description,
          image: imageIpfsUri,
          attributes: [
            { trait_type: "Category", value: category },
            { trait_type: "Collection", value: activeCollection },
            { trait_type: "Royalty", value: royalty }
          ]
        };

        // 3. Upload JSON Metadata to Pinata
        const tokenURI = await uploadJSONToIPFS(metadata);

        // 4. Pass the CID to the blockchain contract
        await onMint(metadata, tokenURI);

        // Success Reset
        setImageFile(null);
        setImagePreview('');
        setName('');
        setDescription('');
        alert('Artifact Successfully Minted! Check your MetaMask NFT tab.');
        
      } catch (error) {
        console.error("The forge failed:", error);
        alert('The Gods rejected your transaction. Check gas and Pinata keys.');
      } finally {
        setIsMinting(false);
      }
    });
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl text-amber-400 mb-2">Forge a New NFT</h1>
        <p className="text-gray-400">Create your own divine artifact and mint it to the blockchain</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Image Upload */}
          <div>
            <label className="block text-gray-400 mb-3">NFT Image *</label>
            <div
              className="relative border-2 border-dashed border-amber-900/30 rounded-xl p-8 hover:border-amber-600/50 transition-all duration-300 cursor-pointer group bg-slate-900/50"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-400">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-300 mb-1">Upload NFT Image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-400 mb-3">NFT Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
              placeholder="Enter NFT name..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-400 mb-3">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-gray-400 mb-3">Collection *</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="existing-collection"
                  checked={!useNewCollection}
                  onChange={() => setUseNewCollection(false)}
                  className="w-4 h-4"
                />
                <label htmlFor="existing-collection" className="text-gray-300">
                  Use existing collection
                </label>
              </div>
              {!useNewCollection && (
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                >
                  <option value="">Select a collection</option>
                  <option value="Olympian Pantheon">Olympian Pantheon</option>
                  <option value="Elder Titans">Elder Titans</option>
                  <option value="Legendary Heroes">Legendary Heroes</option>
                  <option value="Mythical Beasts">Mythical Beasts</option>
                  <option value="Sacred Relics">Sacred Relics</option>
                </select>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="new-collection"
                  checked={useNewCollection}
                  onChange={() => setUseNewCollection(true)}
                  className="w-4 h-4"
                />
                <label htmlFor="new-collection" className="text-gray-300">
                  Create new collection
                </label>
              </div>
              {useNewCollection && (
                <input
                  type="text"
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                  placeholder="Enter collection name..."
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 mb-3">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none resize-none"
              placeholder="Describe your NFT..."
            />
          </div>

          {/* Royalty */}
          <div>
            <label className="block text-gray-400 mb-3">
              Creator Royalty (%) *
            </label>
            <input
              type="number"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              min="0"
              max="50"
              step="0.1"
              className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
              placeholder="10"
            />
            <p className="text-sm text-gray-500 mt-2">
              Percentage you'll receive from future sales (0-50%)
            </p>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black rounded-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            Mint NFT
            <Sparkles className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Right: Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky top-32"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-amber-900/30 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl text-amber-400 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              NFT Preview
            </h3>

            <div className="aspect-[1.618/1] bg-slate-950/50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="NFT Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Upload an image to preview</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Name</p>
                <p className="text-amber-400">{name || 'Untitled NFT'}</p>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <p className="text-white">{category}</p>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Collection</p>
                <p className="text-white">
                  {useNewCollection ? newCollection || 'New Collection' : collection || 'Not selected'}
                </p>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-white text-sm line-clamp-3">
                  {description || 'No description yet'}
                </p>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Creator Royalty</p>
                <p className="text-amber-400">{royalty}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
