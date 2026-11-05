import { useState } from 'react';
import Image from 'next/image';

interface Shoe {
  _id: string;
  productName: string;
  orderNumber: number;
  images: Array<{
    asset: {
      url: string;
    };
  }>;
  price: number;
  // ... other properties
}

interface SelectPageProps {
  shoes: Shoe[];
}

type PriceGroup = 50 | 70 | 90 | 100 | 140 | 150 | 200 | 250;

export default function SelectPageComponent({ shoes }: SelectPageProps) {
  const [selectedGroups, setSelectedGroups] = useState<Map<PriceGroup, Set<number>>>(new Map());
  const [activeGroup, setActiveGroup] = useState<PriceGroup>(50);

  // Initialize all groups
  const initializeGroup = (group: PriceGroup) => {
    if (!selectedGroups.has(group)) {
      selectedGroups.set(group, new Set());
    }
  };

  // Initialize all groups on component mount
  useState(() => {
    const groups: PriceGroup[] = [50, 70, 90, 100, 140, 150, 200, 250];
    groups.forEach(group => initializeGroup(group));
  });

  const toggleProductSelection = (orderNumber: number, group: PriceGroup) => {
    const newGroups = new Map(selectedGroups);
    const groupSet = newGroups.get(group) || new Set();
    
    if (groupSet.has(orderNumber)) {
      groupSet.delete(orderNumber);
    } else {
      // Remove from other groups first
      const allGroups: PriceGroup[] = [50, 70, 90, 100, 140, 150, 200, 250];
      allGroups.forEach(g => {
        if (g !== group) {
          const otherGroup = newGroups.get(g);
          if (otherGroup?.has(orderNumber)) {
            otherGroup.delete(orderNumber);
          }
        }
      });
      groupSet.add(orderNumber);
    }
    
    newGroups.set(group, groupSet);
    setSelectedGroups(newGroups);
  };

  const getProductGroup = (orderNumber: number): PriceGroup | null => {
    for (const [group, set] of selectedGroups.entries()) {
      if (set.has(orderNumber)) {
        return group;
      }
    }
    return null;
  };

  const shareSelectedProducts = () => {
    const nonEmptyGroups = Array.from(selectedGroups.entries())
      .filter(([_, set]) => set.size > 0)
      .sort(([a], [b]) => a - b);

    if (nonEmptyGroups.length === 0) {
      alert('Please select at least one product');
      return;
    }

    let message = '';

    nonEmptyGroups.forEach(([group, orderNumbers], index) => {
      const sortedNumbers = Array.from(orderNumbers)
        .sort((a, b) => a - b)
        .map(num => `"${num}"`)
        .join(',');

      if (sortedNumbers) {
        if (index > 0) message += '\n\n';
        message += `${group}rs extra - ${sortedNumbers}`;
      }
    });

    if (navigator.share) {
      navigator.share({
        title: 'Selected Products by Group',
        text: message,
      }).catch(error => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(message)
        .then(() => alert('Order numbers copied to clipboard!'))
        .catch(err => {
          console.error('Failed to copy: ', err);
          const textArea = document.createElement('textarea');
          textArea.value = message;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Order numbers copied to clipboard!');
        });
    }
  };

  const getGroupCount = (group: PriceGroup): number => {
    return selectedGroups.get(group)?.size || 0;
  };

  const getTotalSelectedCount = (): number => {
    return Array.from(selectedGroups.values()).reduce(
      (total, set) => total + set.size, 0
    );
  };

  const getGroupColor = (group: PriceGroup): string => {
    const colors = {
      50: 'bg-green-500',
      70: 'bg-emerald-500',
      90: 'bg-teal-500',
      100: 'bg-blue-500',
      140: 'bg-indigo-500',
      150: 'bg-purple-500',
      200: 'bg-pink-500',
      250: 'bg-red-500'
    };
    return colors[group];
  };

  const getGroupBorderColor = (group: PriceGroup): string => {
    const colors = {
      50: 'border-green-500 ring-green-500',
      70: 'border-emerald-500 ring-emerald-500',
      90: 'border-teal-500 ring-teal-500',
      100: 'border-blue-500 ring-blue-500',
      140: 'border-indigo-500 ring-indigo-500',
      150: 'border-purple-500 ring-purple-500',
      200: 'border-pink-500 ring-pink-500',
      250: 'border-red-500 ring-red-500'
    };
    return colors[group];
  };

  const clearGroup = (group: PriceGroup) => {
    const newGroups = new Map(selectedGroups);
    newGroups.set(group, new Set());
    setSelectedGroups(newGroups);
  };

  const clearAllGroups = () => {
    const newGroups = new Map();
    const groups: PriceGroup[] = [50, 70, 90, 100, 140, 150, 200, 250];
    groups.forEach(group => newGroups.set(group, new Set()));
    setSelectedGroups(newGroups);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header Section */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Main Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Select Products by Price Group</h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Group Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active Group:</span>
                <select 
                  value={activeGroup}
                  onChange={(e) => setActiveGroup(Number(e.target.value) as PriceGroup)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={50}>50rs extra</option>
                  <option value={70}>70rs extra</option>
                  <option value={90}>90rs extra</option>
                  <option value={100}>100rs extra</option>
                  <option value={140}>140rs extra</option>
                  <option value={150}>150rs extra</option>
                  <option value={200}>200rs extra</option>
                  <option value={250}>250rs extra</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Total: {getTotalSelectedCount()}
                </span>
                <button
                  onClick={shareSelectedProducts}
                  disabled={getTotalSelectedCount() === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                    getTotalSelectedCount() === 0
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Share Groups
                </button>
              </div>
            </div>
          </div>

          {/* Group Summary */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
            {([50, 70, 90, 100, 140, 150, 200, 250] as PriceGroup[]).map((group) => (
              <div
                key={group}
                className={`p-2 rounded-lg border-2 text-center cursor-pointer transition-all ${
                  activeGroup === group
                    ? `${getGroupColor(group)} text-white border-white shadow-md`
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                }`}
                onClick={() => setActiveGroup(group)}
              >
                <div className="font-semibold text-sm">+{group}rs</div>
                <div className="text-xs opacity-80">
                  {getGroupCount(group)} items
                </div>
              </div>
            ))}
          </div>

          {/* Active Groups Bar */}
          {getTotalSelectedCount() > 0 && (
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-wrap gap-1 flex-1">
                {([50, 70, 90, 100, 140, 150, 200, 250] as PriceGroup[]).map((group) => {
                  const count = getGroupCount(group);
                  if (count === 0) return null;
                  
                  return (
                    <div
                      key={group}
                      className={`${getGroupColor(group)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}
                    >
                      <span>+{group}rs: {count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearGroup(group);
                        }}
                        className="w-4 h-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={clearAllGroups}
                className="ml-3 px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Products Grid */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {shoes.map((shoe) => {
              const productGroup = getProductGroup(shoe.orderNumber);
              const isSelected = productGroup !== null;
              const isActiveGroup = productGroup === activeGroup;

              return (
                <div
                  key={shoe._id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 bg-white ${
                    isSelected
                      ? `${getGroupBorderColor(productGroup!)} ring-1 shadow-md`
                      : 'border-gray-200 hover:shadow-md'
                  } ${isActiveGroup ? 'scale-105 shadow-lg' : ''}`}
                  onClick={() => toggleProductSelection(shoe.orderNumber, activeGroup)}
                >
                  {/* Order Number Badge */}
                  <div className="absolute top-1 right-1 bg-black bg-opacity-80 text-white px-1.5 py-0.5 rounded text-xs font-bold z-10">
                    #{shoe.orderNumber}
                  </div>

                  {/* Group Badge */}
                  {isSelected && (
                    <div className={`absolute top-1 left-1 ${getGroupColor(productGroup!)} text-white px-1.5 py-0.5 rounded text-xs font-bold z-10`}>
                      +{productGroup}
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative h-40 w-full">
                    {shoe.images?.[0]?.asset?.url ? (
                      <Image
                        src={shoe.images[0].asset.url}
                        alt={shoe.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className="absolute bottom-1 right-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? `${getGroupColor(productGroup!)} border-white`
                          : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <h3 className="font-semibold text-xs mb-1 truncate">{shoe.productName}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-xs">${shoe.price}</p>
                      {isSelected && (
                        <span className={`text-xs font-bold ${getGroupColor(productGroup!)} text-white px-1.5 py-0.5 rounded`}>
                          +{productGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}