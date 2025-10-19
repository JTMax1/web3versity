import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, DollarSign, Clock, TrendingDown, Zap } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';

export const PaymentComparison: React.FC = () => {
  const [amount, setAmount] = useState(500);
  
  const traditionalFee = amount * 0.10; // 10% average
  const traditionalTime = "2-5 days";
  const traditionalReceived = amount - traditionalFee;
  
  const cryptoFee = 0.50; // Under $1 for stablecoin on Hedera
  const cryptoTime = "3-5 seconds";
  const cryptoReceived = amount - cryptoFee;
  
  const savedAmount = traditionalFee - cryptoFee;
  const savedPercentage = ((savedAmount / traditionalFee) * 100).toFixed(0);

  return (
    <div className="w-full space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3>Cross-Border Payment Comparison</h3>
        <p className="text-muted-foreground">
          Compare traditional remittance vs crypto for sending money from South Africa to Nigeria
        </p>
      </div>

      {/* Amount Slider */}
      <Card className="p-6 space-y-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="flex justify-between items-center">
          <span>Sending Amount</span>
          <span className="font-bold text-2xl">${amount}</span>
        </div>
        <Slider
          value={[amount]}
          onValueChange={(value) => setAmount(value[0])}
          min={100}
          max={2000}
          step={50}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground text-center">
          Adjust to see how fees scale with amount
        </p>
      </Card>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traditional Remittance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 space-y-4 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <h4 className="text-lg">Traditional Remittance</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-sm">Sending</span>
                <span className="font-bold">${amount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm">Fees (8-12%)</span>
                <span className="font-bold text-red-600">-${traditionalFee.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-sm">Hidden FX markup</span>
                <span className="font-bold text-red-600">-${(amount * 0.02).toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-semibold">Recipient Receives</span>
                <span className="text-xl font-bold text-green-600">
                  ${(traditionalReceived - amount * 0.02).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time: {traditionalTime}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Crypto Remittance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 space-y-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-600" />
              <h4 className="text-lg">Crypto with Hedera</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-sm">Sending</span>
                <span className="font-bold">${amount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm">Network Fee</span>
                <span className="font-bold text-green-600">-${cryptoFee.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-sm">Hidden FX markup</span>
                <span className="font-bold text-green-600">$0.00</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-semibold">Recipient Receives</span>
                <span className="text-xl font-bold text-green-600">
                  ${cryptoReceived.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Time: {cryptoTime}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Savings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="text-center space-y-3">
            <DollarSign className="w-12 h-12 mx-auto text-purple-600" />
            <h4 className="text-2xl">You Save ${savedAmount.toFixed(2)}</h4>
            <p className="text-muted-foreground">
              That's {savedPercentage}% savings by using crypto!
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-green-600">{savedPercentage}%</p>
                <p className="text-xs text-muted-foreground">Cheaper</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">99%</p>
                <p className="text-xs text-muted-foreground">Faster</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">24/7</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Real-World Impact */}
      <Card className="p-6 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <h4 className="mb-3">💡 Real-World Impact</h4>
        <div className="space-y-2 text-sm">
          <p>• A family receiving ${amount} monthly saves <span className="font-bold text-green-600">${(savedAmount * 12).toFixed(0)}/year</span> by using crypto</p>
          <p>• That's enough for: School fees, medical care, or starting a small business</p>
          <p>• Money stays with families instead of remittance corporations</p>
          <p>• Instant transfers mean emergency money arrives when needed, not days later</p>
        </div>
      </Card>
    </div>
  );
};
